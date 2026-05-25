import { createClient } from "redis";

// Create client with redis
export const redisClient = createClient({
  url: "redis://localhost:6379",
});

//If connecting with client throws an error run this
redisClient.on("error", (err) => {
  console.error("Redis error: ", err);
});

// Here we are creating a connectRedis function that is used to actually
// connect with redis

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected successfully");
};
