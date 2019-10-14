const db = require("./db_connect");

module.exports.getAllWorkouts = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  db.getAll("workouts")
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(res)
      });
    })
    .catch(e => {
      console.log(e);
      callback(null, {
        statusCode: e.statusCode || 500,
        body: "Error: Could not find workouts: " + e
      });
    });
};

module.exports.getWorkouts = (event, context, callback) => {
  const sql =
    "SELECT * FROM workouts WHERE workoutdifficulty = $1 AND workouttype = ANY ($2) ORDER BY RANDOM() LIMIT ($3)";

  const workoutTypeCalculator = workoutTypeValue => {
    if (workoutTypeValue === "both") {
      return ["kettlebell", "coding"];
    } else if (workoutTypeValue === "coding") {
      return ["coding"];
    } else {
      return ["kettlebell"];
    }
  };

  const workoutType = workoutTypeCalculator(event.pathParameters.workouttype);

  const values = [
    event.pathParameters.workoutdifficulty,
    workoutType,
    event.pathParameters.workoutnumber
  ];

  context.callbackWaitsForEmptyEventLoop = false;

  db.query(sql, values[0], values[1], values[2])
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(res)
      });
    })
    .catch(e => {
      callback(null, {
        statusCode: e.statusCode || 500,
        body: "Could not find workout: " + e
      });
    });
};
