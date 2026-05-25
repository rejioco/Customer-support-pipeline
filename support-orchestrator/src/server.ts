import express from "express";
import { runPipeline } from "./runPipeline";
import { connectRedis } from "./config/redis";
import { redisClient } from "./config/redis";

const app = express();
app.use(express.json());
const PORT = 6969;

app.post("/query", async (req, res) => {
  try {
    const { query,sessionId } = req.body;
    // session id looks like this : "abc123" => one of the sessions
    // Redis key => "chat:abc123" -> [] or [array of old messages]
    // Find out any pre-existing message history
    const key = `chat:${sessionId}`;
    const existingChat = await redisClient.get(key);
    const messages = existingChat?JSON.parse(existingChat):[];
    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    // Invoke runPipeline function => returns me a state
    const response = await runPipeline(query,messages);
    //
    const updatedMessages = [
      ...messages,
      {
        role:"user",
        content:query
      },
      {
        role:"assistant",
        content:response.finalResponse
      }
    ]
    // Save to redis
    await redisClient.set(key,JSON.stringify(updatedMessages))
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// The user query has to go in the pipeline

await connectRedis(); // calling the function that is used to connect with redis

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
