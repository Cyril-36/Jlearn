const request = require('supertest');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Import your submit route
const submitRoute = require('../routes/submit');

app.use(bodyParser.json());
app.use('/api/submit', submitRoute);

describe('POST /api/submit', () => {
  it('should return a verdict', async () => {
    const res = await request(app).post('/api/submit').send({
      challengeId: 'unit-i-introduction-to-java-1',
      code: `public class Solution {
        public static void main(String[] args) {
          java.util.Scanner sc = new java.util.Scanner(System.in);
          int n = sc.nextInt();
          if(n % 2 == 0) System.out.println("Not Weird");
          else System.out.println("Weird");
        }
      }`,
      stdin: '4\n',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('verdict');
    expect(['Passed', 'Failed']).toContain(res.body.verdict);
  });
});
