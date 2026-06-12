import { qdrant } from "./qdrant.js";

/**
 * Creates the conversation_memory Qdrant collection.
 * Run once: npx tsx src/setupConversationMemory.ts
 *
 * Vector size must match the embedding model:
 *   nomic-embed-text → 768 dimensions
 */
const setup = async () => {
  await qdrant.createCollection("conversation_memory", {
    vectors: {
      size: 768,        // same model as support-docs
      distance: "Cosine",
    },
  });

  // Index the sessionId payload field so filtered searches are fast
  await qdrant.createPayloadIndex("conversation_memory", {
    field_name: "sessionId",
    field_schema: "keyword",
  });

  console.log("conversation_memory collection created with sessionId index ✓");
};

setup().catch(console.error);


