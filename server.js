const express = require('express');
const router = require('./routes/index');

const app = express();

// Router middleware at the root path
app.use(express.json());

app.use('/', router);

// Set the port from the environment variable
const port = process.env.PORT || 5000;

// Start server and log message
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
