const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const baseTmp = path.join(__dirname, '..', 'tmp');

if (!fs.existsSync(baseTmp)) {
  fs.mkdirSync(baseTmp, { recursive: true });
}

function runCode(code, input = '') {
  return new Promise((resolve) => {
    const tmpDir = fs.mkdtempSync(path.join(baseTmp, 'run-'));
    const srcPath = path.join(tmpDir, 'Solution.java');
    fs.writeFileSync(srcPath, code);

    const compile = spawnSync(
      'javac',
      ['--release', '17', 'Solution.java'],
      {
        cwd: tmpDir,
        encoding: 'utf8',
        timeout: 2000,
      }
    );

    if (compile.error || compile.status !== 0) {
      return resolve({
        stdout: compile.stdout,
        stderr: compile.stderr || compile.error?.message,
        exitCode: compile.status ?? 1,
        time: 0,
      });
    }

    const start = Date.now();
    const run = spawnSync(
      'java',
      ['-Xmx256m', 'Solution'],
      {
        cwd: tmpDir,
        input,
        encoding: 'utf8',
        timeout: 2000,
      }
    );
    const time = Date.now() - start;

    resolve({
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.status,
      time,
    });
  });
}

module.exports = { runCode };
