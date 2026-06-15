import "dotenv/config";
import readline from "readline/promises";
import chalk from "chalk";
import { randomUUID } from "crypto";
import { runPipeline } from "../runPipeline.js";
import { connectRedis, redisClient } from "../config/redis.js";
import { qdrant } from "../qdrant.js";
import { generateEmbedding } from "../embed.js";
import { SupportState } from "../state.js";
import { escalationNode } from "../nodes/escalation.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


function wrapText(text: string, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const result: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(" ");
    let currentLine = "";
    for (const word of words) {
      if ((currentLine ? currentLine.length + 1 : 0) + word.length <= maxWidth) {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      } else {
        if (currentLine) {
          result.push(currentLine);
        }
        currentLine = word;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
  }
  return result;
}

async function getAvailableSessions(): Promise<string[]> {
  try {
    const keys = await redisClient.keys("chat:*");
    return keys.map((key) => key.replace("chat:", ""));
  } catch (err) {
    return [];
  }
}

async function renderHeader() {
  console.clear();
  console.log(chalk.bold.cyan(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║             SUPPORT ORCHESTRATOR TERMINAL                ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `));
  console.log(chalk.dim("  Type ") + chalk.yellow("/exit") + chalk.dim(" to quit, ") + chalk.yellow("/session") + chalk.dim(" to switch sessions, or ") + chalk.yellow("/help") + chalk.dim(" for info.\n"));
}

async function main() {
  await connectRedis();
  await renderHeader();

  let sessionId = `session_${randomUUID().slice(0, 8)}`;
  console.log(chalk.green(`  [Active Session: ${sessionId}] (New Session)\n`));

  while (true) {
    const query = await rl.question(chalk.bold.blue("\nYou: "));
    const trimmedQuery = query.trim();

    if (!trimmedQuery) continue;

    if (trimmedQuery === "/exit") {
      console.log(chalk.yellow("\nGoodbye!"));
      process.exit(0);
    }

    if (trimmedQuery === "/session") {
      const sessions = await getAvailableSessions();
      console.log(chalk.bold.cyan("\n--- Available Sessions ---"));
      if (sessions.length === 0) {
        console.log(chalk.dim("No saved sessions found."));
      } else {
        sessions.forEach((s, idx) => console.log(` [${idx + 1}] ${s}`));
      }
      console.log(" [N] Create a new session");
      
      const choice = await rl.question(chalk.yellow("\nSelect session number or Enter new ID: "));
      const num = parseInt(choice);
      if (!isNaN(num) && num > 0 && num <= sessions.length) {
        sessionId = sessions[num - 1];
        console.log(chalk.green(`\nActive session switched to: ${sessionId}`));
      } else if (choice.toLowerCase() === "n" || !choice.trim()) {
        sessionId = `session_${randomUUID().slice(0, 8)}`;
        console.log(chalk.green(`\nCreated new session: ${sessionId}`));
      } else {
        sessionId = choice.trim();
        console.log(chalk.green(`\nActive session set to: ${sessionId}`));
      }
      continue;
    }

    if (trimmedQuery === "/help") {
      console.log(chalk.cyan(`
Available Commands:
  /session  - List existing chat sessions or create/switch to a new one
  /exit     - Exit the orchestrator
  /help     - Show this help message
      `));
      continue;
    }

    // Load conversation history from Redis
    const historyKey = `chat:${sessionId}`;
    const existingChat = await redisClient.get(historyKey);
    const messages = existingChat ? JSON.parse(existingChat) : [];

    console.log(chalk.dim("\nRouting query through the pipeline...\n"));

    // Run the pipeline
    let state = await runPipeline(trimmedQuery, messages, sessionId);

    // Interactive HITL loop
    while (state.humanApproval) {
      console.log("\n" + chalk.bold.red("┌────────────────────────────────────────────────────────┐"));
      console.log(chalk.bold.red("│ ⚠️  HUMAN APPROVAL REQUIRED                             │"));
      console.log(chalk.bold.red("├────────────────────────────────────────────────────────┤"));
      console.log(`│ ${chalk.bold("Workflow ID:")} ${state.workflowId}`);
      console.log(`│ ${chalk.bold("Tool Name:")}   ${chalk.yellow(state.toolNameHumanApproval)}`);
      console.log(`│ ${chalk.bold("Arguments:")}   ${chalk.cyan(JSON.stringify(state.toolInputHumanApproval))}`);
      console.log(chalk.bold.red("└────────────────────────────────────────────────────────┘"));

      const answer = await rl.question(chalk.yellow("\nApprove execution? (y/n): "));
      const isApproved = answer.toLowerCase().startsWith("y");

      if (isApproved) {
        console.log(chalk.green("\n✔ Tool call approved. Resuming pipeline execution...\n"));
        // Prepare state for resumption
        state.humanApprovalApproved = true;
        state.humanApproval = false;
        state.toolName = state.toolNameHumanApproval;
        state.toolInput = state.toolInputHumanApproval;

        // Resume pipeline
        state = await runPipeline(state.query, state.messages || [], state.sessionId, state);
      } else {
        console.log(chalk.red("\n✖ Tool call rejected. Escalating support ticket...\n"));
        // Route to escalation
        state.humanApprovalApproved = false;
        state.humanApproval = false;
        state = await escalationNode(state);
      }
    }

    // Persist finalized response in chat history
    if (state.finalResponse) {
      const updatedMessages = [
        ...messages,
        { role: "user" as const, content: trimmedQuery },
        { role: "assistant" as const, content: state.finalResponse },
      ];
      await redisClient.set(historyKey, JSON.stringify(updatedMessages));

      // Save Q&A turn in conversation_memory (Qdrant) if not escalated
      if (!state.escalationNeeded) {
        try {
          const memoryText = `User: ${trimmedQuery}\nAssistant: ${state.finalResponse}`;
          const embedding = await generateEmbedding(memoryText);
          await qdrant.upsert("conversation_memory", {
            wait: false,
            points: [
              {
                id: randomUUID(),
                vector: embedding,
                payload: {
                  sessionId,
                  query: trimmedQuery,
                  response: state.finalResponse,
                  timestamp: Date.now(),
                },
              },
            ],
          });
        } catch (err) {
          // Silent catch if Qdrant isn't fully set up or errors
        }
      }

      // Output Response Card
      console.log("\n" + chalk.bold.green("┌" + "─".repeat(56) + "┐"));
      console.log(chalk.bold.green("│" + " ".repeat(21) + "AGENT RESPONSE" + " ".repeat(21) + "│"));
      console.log(chalk.bold.green("├" + "─".repeat(56) + "┤"));
      
      // Print formatted output wrapping lines where needed
      const lines = wrapText(state.finalResponse, 54);
      for (const line of lines) {
        console.log(chalk.green(`│ `) + line.padEnd(54) + chalk.green(` │`));
      }
      console.log(chalk.bold.green("└" + "─".repeat(56) + "┘"));

      // Output Latency Metrics Table
      if (state.metrics) {
        console.log(chalk.cyan("\n📊 Execution Metrics:"));
        const tableData = [
          { Node: "Classification", Latency: `${state.metrics.classificationLatencyMs ?? 0} ms` },
          { Node: "Retrieval", Latency: `${state.metrics.retrievalLatencyMs ?? 0} ms` },
          { Node: "Retrieval Validation", Latency: `${state.metrics.retrievalValidationLatencyMs ?? 0} ms` },
          { Node: "Tool decision latency", Latency: `${state.metrics.toolDecisionLatencyMs ?? 0} ms` },
          { Node: "Tool call latency", Latency: `${state.metrics.toolCallLatencyMs ?? 0} ms` },
          { Node: "Generation", Latency: `${state.metrics.generationLatencyMs ?? 0} ms` },
        ];
        console.table(tableData);
        console.log(chalk.bold.cyan(`Total Turn Latency: ${state.metrics.totalLatencyMs ?? 0} s`));
      }
    } else {
      console.log(chalk.red("\nPipeline finished without a final response."));
    }
  }
}

main().catch((err) => {
  console.error("CLI encountered an error:", err);
  process.exit(1);
});