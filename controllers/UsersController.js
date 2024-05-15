const crypto = require('crypto');
const dbClient = require('../utils/db'); // database client

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if the email already exists in the database
      const existingUser = await dbClient
        .collection('users')
        .findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password
      const hashpassword = crypto
        .createHash('sha1')
        .update(password)
        .digest('hex');

      // Create a new user document
      const newUser = {
        email,
        password: hashpassword,
      };

      // Insert the new user document into the database
      await dbClient.collection('users').insertOne(newUser);

      // Return the newly created user with only email and id
      return res.status(201).json({ email: newUser.email, id: newUser._id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = UsersController;
