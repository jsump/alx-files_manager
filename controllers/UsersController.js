const redisClient = require("../utils/redis"); // redis client
const dbClient = require("../utils/db"); // database client
const AuthController = require('./AuthController');
const crypto = require("crypto");

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    // Email is missing
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    // password is missing
    if (!password) {
      return res.status(400).json({ error: "Missing password" });
    }

    try {
      // Check if the email already exists in the database
      const db = dbClient.client.db(dbClient.dbName); // Get the database object
      const existingUser = await db.collection("users").findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: "Already exist" });
      }

      // Hash the password
      const hashpassword = crypto
        .createHash("sha1")
        .update(password)
        .digest("hex");

      // Create a new user document
      const newUser = {
        email,
        password: hashpassword,
      };

      // Insert the new user document into the database
      const result = await db.collection("users").insertOne(newUser);

      // Return the newly created user with only email and id
      return res
        .status(201)
        .json({ id: result.insertedId, email: newUser.email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // retrieve the user base on the token
  getMe: async (req, res) => {
    const { token } = req.headers;

    try {
      // Retrieve user ID based on the token from Redis
      const userId = await redisClient.get(`auth_${token}`);

      // If token is not found, return Unauthorized error
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Retrieve user object from the database using the user ID
      const user = await dbClient
        .db()
        .collection("users")
        .findOne({ _id: userId });

      // If user not found, return Unauthorized error
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Return the user object (email and id only)
      return res.status(200).json({ email: user.email, id: user._id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = UsersController;
