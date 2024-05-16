const redisClient = require('../utils/redis'); // Redis client
const dbClient = require('../utils/db'); // Database client
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const AuthController = {
  getConnect: async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extracting credentials from the Authorization header
    const encodedCredentials = authorization.split(' ')[1];
    let decodedCredentials;
    try {
      // Decoding Base64 credentials
      decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
        'utf-8'
      );
    } catch (error) {
      // If decoding fails, return Unauthorized error
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = decodedCredentials.split(':');

    try {
      // Find user in the database by email and hashed password
      const db = dbClient.client.db(dbClient.dbName); // Access the database directly
      const hashedPassword = crypto
        .createHash('sha1')
        .update(password)
        .digest('hex');
      const user = await db
        .collection('users')
        .findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a random token
      const token = uuidv4();

      // Create a key in Redis
      const redisKey = `auth_${token}`;

      // Calculate the expiry time in milliseconds (24 hours)
      const expiryTimeMilliseconds = Date.now() + 24 * 60 * 60 * 1000;

      // Convert milliseconds to seconds
      const expiryTimeSeconds = Math.floor(expiryTimeMilliseconds / 1000);


      // Store the user ID in Redis with the token as key, expires in 24 hours
      await redisClient.set(redisKey, user._id.toString(), expiryTimeSeconds);
      
      
      // Return the token with status code 200
      return res.status(200).json({ token: token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getDisconnect: async (req, res) => {
    const { token } = req.headers;

    try {
      // Retrieve user ID based on the token from Redis
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis
      await redisClient.del(`auth_${token}`);

      // Return nothing with status code 204
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = AuthController;
