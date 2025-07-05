const { runCode } = require('./codeRunner');

/**
 * Execute the provided code against a list of test cases. Each test case should
 * contain an `input` value and the expected `output`. The function returns an
 * object with an aggregated score and detailed results for every test.
 */
async function runTests(code, tests = []) {
  const results = [];
  let passed = 0;

  for (const test of tests) {
    try {
      const { stdout, stderr, exitCode, time } = await runCode(code, test.input);
      let verdict = 'Fail';

      if (exitCode !== 0) {
        verdict = exitCode === null ? 'TLE' : 'CE';
      } else if (String(stdout).trim() === String(test.output).trim()) {
        verdict = 'Pass';
        passed += 1;
      }

      results.push({
        input: test.input,
        expected: test.output,
        stdout,
        stderr,
        exitCode,
        verdict,
        time,
      });
    } catch (err) {
      results.push({
        input: test.input,
        expected: test.output,
        stdout: '',
        stderr: err.toString(),
        exitCode: 1,
        verdict: 'CE',
      });
    }
  }

  const score = tests.length ? Math.round((passed / tests.length) * 100) : 0;
  return { score, results };
}

module.exports = { runTests };
