//We get the Log function from our other file
const { Log } = require('./logger.js');

//function to run our test
async function testTheLogger() {
  console.log("Attempting to send a test log...");

  // We call the Log function with valid data
  await Log("backend", "info", "db", "Test log from my application.");

  console.log("Test complete. Check the console for success or error messages.");
}

// This line runs our test function
testTheLogger();