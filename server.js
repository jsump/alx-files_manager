const express = require('express');
const router = require('./routes');

const app = express();

// Router middleware at the root path
app.use('/', router);

// Set the port from the environment variable
const port = process.env.PORT || 5000;

// Start server and log message
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
