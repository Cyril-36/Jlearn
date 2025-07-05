const { runCode } = require('../services/codeRunner');

describe('runCode', () => {
  test('executes Java program', async () => {
    const code = `public class Solution { public static void main(String[] args){ System.out.print("Hello"); } }`;
    const result = await runCode(code);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('Hello');
  });
});
