const redisClient = require('../utils/redis'); // redis client
const dbClient = require('../utils/db'); // database client
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');


const AuthController = {
  connect: async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encodedCredentials = authorization.split(' ')[1];
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64'
    ).toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    try {
      // Find user in the database by email and hashed password
      const hashedPassword = crypto
        .createHash('sha1')
        .update(password)
        .digest('hex');
      const user = await dbClient
        .db()
        .collection('users')
        .findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a random token
      const token = uuidv4();

      // Store the user ID in Redis with the token as key, expires in 24 hours
      const redisKey = `auth_${token}`;
      await redisClient.set(redisKey, user._id.toString(), 'EX', 24 * 60 * 60);

      // Return the token
      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  disconnect: async (req, res) => {
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
