const axios = require('axios');

const LOGGING_API_URL = "http://20.244.56.144/evaluation-service/logs";

const AUTH_TOKEN =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbmtpdDg1NjgwM0BnbWFpbC5jb20iLCJleHAiOjE3NTczMjI4NjYsImlhdCI6MTc1NzMyMTk2NiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImVlZTVkMjJiLTY2ZjEtNDAxYS05ZDhkLTc3Mjg2NmUzNTBhNCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImFua2l0IHBhbCIsInN1YiI6IjQ0MzAwYzUzLTkwZDAtNDYwMi05MmEzLTA1MjRiYWNkMTA3MCJ9LCJlbWFpbCI6ImFua2l0ODU2ODAzQGdtYWlsLmNvbSIsIm5hbWUiOiJhbmtpdCBwYWwiLCJyb2xsTm8iOiIyMjAxNjQxNTUwMDI1IiwiYWNjZXNzQ29kZSI6InNBV1R1UiIsImNsaWVudElEIjoiNDQzMDBjNTMtOTBkMC00NjAyLTkyYTMtMDUyNGJhY2QxMDcwIiwiY2xpZW50U2VjcmV0IjoiTUJBUXVzWmpySkV3U0RtSCJ9.yMrqLwI_zqkLTILY3ROSIuDJDjlZ6kc5WtVOLpg6Go4";


async function Log(stack, level, package, message) {

  // We put the log details into an object
  const logData = {
    stack: stack,
    level: level,
    package: package,
    message: message
  };

  try {
    // We send the data to the server using a POST request
    await axios.post(LOGGING_API_URL, logData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    console.log('Log was sent successfully!');

  } catch (error) {
  // If the server responded with an error, print the details
  if (error.response) {
    console.error('Error Data:', error.response.data);
    console.error('Error Status:', error.response.status);
  } else {
    // If there was another kind of error, print the general message
    console.error('An error occurred:', error.message);
  }
}
}

// use the Log function in other files
module.exports = { Log };