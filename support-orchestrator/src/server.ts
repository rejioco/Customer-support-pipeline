import "dotenv/config";
import express from "express";
import { randomUUID } from "crypto";
import { runPipeline } from "./runPipeline.js";
import { connectRedis, redisClient } from "./config/redis.js";
import { qdrant } from "./qdrant.js";
import { generateEmbedding } from "./embed.js";
import { v4 as uuidv4 } from "uuid";
import { SupportState } from "./state.js";
import { toolCallNode } from "./nodes/toolCall.js";
import { escalationNode } from "./nodes/escalation.js";

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

    if (response.humanApproval) {
      return res.json({
        status: "pending_approval",
        message: "This action requires human approval.",
        workflowId: response.workflowId,
        toolName: response.toolNameHumanApproval,
        toolInput: response.toolInputHumanApproval,
      });
    }

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

app.post("/approve", async (req, res) => {
  try {
    const { workflowId, approved } = req.body;
    if (!workflowId) {
      return res.status(400).json({ error: "workflowId is required" });
    }
    const existingWorkflow = await redisClient.get(`workflow:${workflowId}`);
    if (!existingWorkflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    const parsedWorkflow = JSON.parse(existingWorkflow) as SupportState;

    if (approved) {
      // Mark as approved and restore the target tool details
      parsedWorkflow.humanApprovalApproved = true;
      parsedWorkflow.humanApproval = false;
      parsedWorkflow.toolName = parsedWorkflow.toolNameHumanApproval;
      parsedWorkflow.toolInput = parsedWorkflow.toolInputHumanApproval;

      // Resume the pipeline
      const finalState = await runPipeline(
        parsedWorkflow.query,
        parsedWorkflow.messages || [],
        parsedWorkflow.sessionId,
        parsedWorkflow
      );

      // Delete the workflow key since it's processed
      await redisClient.del(`workflow:${workflowId}`);

      // Save to chat history if finalized
      if (finalState.finalResponse) {
        const historyKey = `chat:${finalState.sessionId}`;
        const existingChat = await redisClient.get(historyKey);
        const messages = existingChat ? JSON.parse(existingChat) : [];
        const updatedMessages = [
          ...messages,
          { role: "user", content: finalState.query },
          { role: "assistant", content: finalState.finalResponse },
        ];
        await redisClient.set(historyKey, JSON.stringify(updatedMessages));
      }

      return res.json({
        status: "approved",
        finalState
      });
    } else {
      // Rejection: Route to escalation
      parsedWorkflow.humanApprovalApproved = false;
      parsedWorkflow.humanApproval = false;
      
      const finalState = await escalationNode(parsedWorkflow);

      // Delete the workflow key
      await redisClient.del(`workflow:${workflowId}`);

      // Save the escalation message to history
      if (finalState.finalResponse) {
        const historyKey = `chat:${finalState.sessionId}`;
        const existingChat = await redisClient.get(historyKey);
        const messages = existingChat ? JSON.parse(existingChat) : [];
        const updatedMessages = [
          ...messages,
          { role: "user", content: finalState.query },
          { role: "assistant", content: finalState.finalResponse },
        ];
        await redisClient.set(historyKey, JSON.stringify(updatedMessages));
      }

      return res.json({
        status: "rejected",
        finalState
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


await connectRedis();

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
