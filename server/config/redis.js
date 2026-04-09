const redis = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

redisClient.on("error", (err) => console.log("Redis Client Error", err));
pubClient.on("error", (err) => console.log("Redis Pub Error", err));
subClient.on("error", (err) => console.log("Redis Sub Error", err));

const connectRedis = async () => {
    await Promise.all([
        redisClient.connect(),
        pubClient.connect(),
        subClient.connect()
    ]);
    console.log("Redis Connected!");
}

const socketAdapter = createAdapter(pubClient, subClient);

module.exports = { redisClient, pubClient, subClient, connectRedis, socketAdapter };