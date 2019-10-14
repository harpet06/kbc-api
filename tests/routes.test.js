const request = require("supertest");
const { spawn } = require("child_process");

let slsOfflineProcess;

beforeAll(done => {
  jest.setTimeout(20000);
  startSlsOffline(err => {
    if (err) {
      return done(err);
    }
    console.log("its started");
    done();
  });
});

it("checks for a 200 response", async () => {
  const response = await request("http://localhost:3000").get("/workouts");
  expect(response.statusCode).toBe(200);
});

afterAll(() => {
  console.log("closing down serverless");
  stopSlsOffline();
  console.log("night night");
});

const startSlsOffline = done => {
  slsOfflineProcess = spawn("sls", ["offline", "start", "--port", 3000]);
  console.log(`serverless started with PID: ${slsOfflineProcess.pid}`);

  slsOfflineProcess.stdout.on("data", data => {
    if (data.includes("Offline [HTTP] listening on http://localhost:3000")) {
      console.log(data.toString().trim());
      done();
    }
  });

  slsOfflineProcess.stderr.on("data", errData => {
    console.log(`Error starting Serverless Offline:\n${errData}`);
    done(errData);
  });
};

const stopSlsOffline = () => {
  slsOfflineProcess.kill();
  console.log("serverless offline stopped");
};
