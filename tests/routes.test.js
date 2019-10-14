const request = require("supertest");
const { spawn } = require("child_process");

let slsOfflineProcess;
let port = 4000;

beforeAll(done => {
  jest.setTimeout(20000);
  startSlsOffline(err => {
    if (err) {
      return done(err);
    }
    done();
  });
});

it("returns all workouts, in expected format", async () => {
  const response = await request(`http://localhost:${port}`).get(`/workouts`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        whatdescription: expect.any(String),
        dodescription: expect.any(String),
        workimage: expect.any(String),
        workouttype: expect.any(String),
        workoutdifficulty: expect.any(String)
      })
    ])
  );
});

it("returns a a single, beginner, kettlebell workout", async () => {
  const response = await request(`http://localhost:${port}`).get(
    `/workouts/beginner/kettlebell/1`
  );
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(1);
  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        workouttype: "kettlebell",
        workoutdifficulty: "beginner"
      })
    ])
  );
});

it("returns multiple workouts", async () => {
  const response = await request(`http://localhost:${port}`).get(
    `/workouts/beginner/coding/3`
  );
  expect(response.body.length).toBe(3);
});

afterAll(() => {
  stopSlsOffline();
});

const startSlsOffline = done => {
  slsOfflineProcess = spawn("sls", ["offline", "start", "--port", port]);

  slsOfflineProcess.stdout.on("data", data => {
    if (data.includes(`Offline [HTTP] listening on http://localhost:${port}`)) {
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
};
