import redis from "redis";

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // when Connection to Redis does not work
    this.client.on("error", (error) => {
      console.log(`Redis client not connected to the server: ${error}`);
    });
  }

  async isAlive() {
    try {
      const response = await new Promise((resolve, reject) => {
        this.client.ping((error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        });
      });
      
      return response === "PONG";
    } catch (error) {
      console.error("Error checking Redis status:", error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await new Promise((resolve, reject) => {
        this.client.get(key, (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
      
      return value;
    } catch (error) {
      console.error("Error getting value from Redis:", error);
      throw error;
    }
  }

  async set(key, value, duration) {
    try {
      await new Promise((resolve, reject) => {
        this.client.set(key, value, "EX", duration, (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
    } catch (error) {
      console.error("Error setting value in Redis:", error);
      throw error;
    }
  }

  async del(key) {
    try {
      await new Promise((resolve, reject) => {
        this.client.del(key, (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
    } catch (error) {
      console.error("Error deleting value from Redis:", error);
      throw error;
    }
  }
}


const redisClient = new RedisClient();

module.exports = redisClient;
