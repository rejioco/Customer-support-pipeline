import { SupportState, ConversationMemoryEntry } from "../state.js";
import { generateEmbedding } from "../embed.js";
import { qdrant } from "../qdrant.js";

export const retrievalNode = async (
  state: SupportState,
): Promise<SupportState> => {
  console.log("\nRUNNING RETRIEVAL NODE");

  // Single embedding call — shared by both searches
  const queryEmbedding = await generateEmbedding(state.query);

  // Run both Qdrant searches in parallel
  const [supportResults, memoryResults] = await Promise.all([
    // 1. Company policy / support docs
    qdrant.search("support-docs", {
      vector: queryEmbedding,
      limit: 3,
    }),
    // 2. Semantically relevant past turns for this session
    state.sessionId
      ? qdrant.search("conversation_memory", {
          vector: queryEmbedding,
          limit: 3,
          filter: {
            must: [
              {
                key: "sessionId",
                match: { value: state.sessionId },
              },
            ],
          },
        })
      : Promise.resolve([]),
  ]);

  const retrievedDocs = supportResults.map((r) => ({
    score: r.score,
    content: r.payload?.content,
  }));

  const conversationMemory: ConversationMemoryEntry[] = memoryResults.map((r) => ({
    score: r.score,
    query: r.payload?.query as string,
    response: r.payload?.response as string,
    sessionId: r.payload?.sessionId as string,
  }));

  return {
    ...state,
    retrievedDocs,
    conversationMemory,
    currentNode: "retrieval",
  };
};
