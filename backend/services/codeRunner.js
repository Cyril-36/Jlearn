const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const TMP_DIR = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

function runJavaCode(code, input) {
  const folder = path.join(TMP_DIR, uuidv4());
  fs.mkdirSync(folder);
  const filePath = path.join(folder, 'Main.java');
  fs.writeFileSync(filePath, code);

  const compile = spawnSync('javac', ['Main.java'], { cwd: folder, timeout: 2000 });
  if (compile.status !== 0) {
    return { success: false, error: compile.stderr.toString() };
  }

  const run = spawnSync('java', ['Main'], {
    cwd: folder,
    input,
    timeout: 2000,
    maxBuffer: 1024 * 1024,
  });

  return {
    success: true,
    stdout: run.stdout.toString(),
    stderr: run.stderr.toString(),
    exitCode: run.status,
  };
}

module.exports = { runJavaCode };
