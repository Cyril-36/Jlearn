import subprocess
import tempfile
import os
import time
import shutil

# Docker image used for isolated execution (JDK 17 Alpine, ~200MB)
DOCKER_IMAGE = "eclipse-temurin:17-jdk-alpine"

# Detect whether Docker is available at import time
_DOCKER_AVAILABLE = shutil.which("docker") is not None

_DAEMON_ERRORS = ("Cannot connect to the Docker daemon", "docker daemon is not running")


def execute_java_code(code: str, test_input: str = "") -> dict:
    """
    Execute Java code safely.
    Uses Docker isolation when available; falls back to subprocess with JVM limits.
    """
    if _DOCKER_AVAILABLE:
        return _run_in_docker(code, test_input)
    return _run_in_subprocess(code, test_input)


# ── Docker runner ─────────────────────────────────────────────────

def _run_in_docker(code: str, test_input: str) -> dict:
    """
    Compile and run Java code inside a Docker container with:
      - no network access (--network=none)
      - 128 MB RAM cap
      - no new privileges, all capabilities dropped
      - read-only root FS; writable /sandbox tmpfs only
      - 15 s wall-clock timeout (compile + run)
      - PID limit to prevent fork bombs
    """
    with tempfile.TemporaryDirectory() as host_dir:
        java_path = os.path.join(host_dir, "Solution.java")
        with open(java_path, "w") as f:
            f.write(code)

        start = time.time()
        try:
            proc = subprocess.run(
                [
                    "docker", "run", "--rm",
                    "--network=none",
                    "--memory=128m",
                    "--memory-swap=128m",
                    "--cpus=0.5",
                    "--pids-limit=64",
                    "--read-only",
                    "--tmpfs=/sandbox:size=32m,exec",
                    "--security-opt=no-new-privileges",
                    "--cap-drop=ALL",
                    "-v", f"{java_path}:/sandbox/Solution.java:ro",
                    "-w", "/sandbox",
                    DOCKER_IMAGE,
                    "/bin/sh", "-c",
                    "javac Solution.java 2>&1 && java -Xmx96m -Xss512k -XX:+UseSerialGC Solution",
                ],
                input=test_input,
                capture_output=True,
                text=True,
                timeout=15,
            )
            elapsed = int((time.time() - start) * 1000)

            if proc.returncode != 0:
                stderr = proc.stderr or ""
                # If the Docker daemon is not running, fall back to subprocess
                if any(msg in stderr for msg in _DAEMON_ERRORS):
                    return _run_in_subprocess(code, test_input)
                return {"success": False, "output": proc.stdout or stderr, "execution_time_ms": elapsed}
            return {"success": True, "output": proc.stdout, "execution_time_ms": elapsed}

        except subprocess.TimeoutExpired:
            return {"success": False, "output": "Execution timed out (> 15 seconds).", "execution_time_ms": 15000}
        except FileNotFoundError:
            # Docker binary disappeared mid-process; fall back
            return _run_in_subprocess(code, test_input)


# ── Subprocess fallback runner ────────────────────────────────────

def _run_in_subprocess(code: str, test_input: str) -> dict:
    """
    Compile and run Java code in a temp dir with JVM resource caps.
    WARNING: does not provide OS-level isolation — use Docker in production.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        java_file_path = os.path.join(temp_dir, "Solution.java")
        with open(java_file_path, "w") as f:
            f.write(code)

        # Compile
        compile_start = time.time()
        try:
            compile_process = subprocess.run(
                ["javac", "Solution.java"],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=10,
            )
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "Compilation timed out (> 10 seconds).",
                "execution_time_ms": 10000,
            }

        if compile_process.returncode != 0:
            return {
                "success": False,
                "output": compile_process.stderr,
                "execution_time_ms": int((time.time() - compile_start) * 1000),
            }

        # Run with JVM resource limits
        run_start = time.time()
        try:
            run_process = subprocess.run(
                [
                    "java",
                    "-Xmx128m",
                    "-Xss512k",
                    "-XX:MaxMetaspaceSize=64m",
                    "-XX:+UseSerialGC",
                    "Solution",
                ],
                cwd=temp_dir,
                input=test_input,
                capture_output=True,
                text=True,
                timeout=5,
            )
            run_time = int((time.time() - run_start) * 1000)

            if run_process.returncode != 0:
                return {"success": False, "output": run_process.stderr, "execution_time_ms": run_time}
            return {"success": True, "output": run_process.stdout, "execution_time_ms": run_time}

        except subprocess.TimeoutExpired:
            return {"success": False, "output": "Execution timed out (> 5 seconds).", "execution_time_ms": 5000}
