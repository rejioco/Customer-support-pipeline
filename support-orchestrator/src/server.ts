import "dotenv/config";
import express from "express";
import { randomUUID } from "crypto";
import { runPipeline } from "./runPipeline.js";
import { connectRedis, redisClient } from "./config/redis.js";
import { qdrant } from "./qdrant.js";
import { generateEmbedding } from "./embed.js";

const app = express();
app.use(express.json());
const PORT = 6969;

app.post("/query", async (req, res) => {
  try {
    const { query, sessionId } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // ── Conversation history (Redis) ──────────────────────────────────────
    const historyKey = `chat:${sessionId}`;
    const existingChat = await redisClient.get(historyKey);
    const messages = existingChat ? JSON.parse(existingChat) : [];

    // ── Pipeline ──────────────────────────────────────────────────────────
    const response = await runPipeline(query, messages, sessionId);

    // ── Persist ordered chat history (Redis) ──────────────────────────────
    const updatedMessages = [
      ...messages,
      { role: "user",      content: query },
      { role: "assistant", content: response.finalResponse },
    ];
    await redisClient.set(historyKey, JSON.stringify(updatedMessages));

    // ── Store Q&A turn in conversation_memory (Qdrant) ────────────────────
    // Only store successful, non-escalated responses so memory stays clean
    if (response.finalResponse && !response.escalationNeeded) {
      const memoryText = `User: ${query}\nAssistant: ${response.finalResponse}`;
      const embedding = await generateEmbedding(memoryText);
      await qdrant.upsert("conversation_memory", {
        wait: false, // non-blocking — don't slow down the HTTP response
        points: [
          {
            id: randomUUID(),
            vector: embedding,
            payload: {
              sessionId,
              query,
              response: response.finalResponse,
              timestamp: Date.now(),
            },
          },
        ],
      });
      console.log(`\nMEMORY STORED for session: ${sessionId}`);
    }

    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

await connectRedis();

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
