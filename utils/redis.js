import redis from "redis";

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // When connection to Redis does not work
    this.client.on("error", (error) => {
      console.log(`Redis client not connected to the server: ${error}`);
    });
  }

  isAlive() {
    return new Promise((resolve) => {
      this.client.ping((error, response) => {
        if (error) {
          // If there's an error, Redis is not alive
          resolve(false);
        } else {
          // If response is "PONG", Redis is alive
          resolve(response === "PONG");
        }
      });
    });
  }

  async get(key) {
    try {
      return await new Promise((resolve, reject) => {
        this.client.get(key, (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
    } catch (error) {
      console.error(`Error getting value from Redis for key ${key}:`, error);
      throw error; // Rethrow the error for handling at a higher level
    }
  }

  async set(key, value, duration) {
    try {
      return await new Promise((resolve, reject) => {
        this.client.set(key, value, "EX", duration, (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
    } catch (error) {
      console.error(`Error setting value in Redis for key ${key}:`, error);
      throw error; // Rethrow the error for handling at a higher level
    }
  }

  async del(key) {
    try {
      return await new Promise((resolve, reject) => {
        this.client.del(key, (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
    } catch (error) {
      console.error(`Error deleting value from Redis for key ${key}:`, error);
      throw error; // Rethrow the error for handling at a higher level
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
