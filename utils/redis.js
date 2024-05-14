import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // when Connection to Redis does not work
    this.client.on('error', (error) => {
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
          resolve(response === 'PONG');
        }
      });
    });
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }
}

const redisClient = new RedisClient();

(async () => {
  const alive = await redisClient.isAlive();
  console.log(alive);
})();

module.exports = redisClient;