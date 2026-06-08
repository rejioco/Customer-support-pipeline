import { SupportState } from "../state.js";
import { generateEmbedding } from "../embed.js";
import { qdrant } from "../qdrant.js";

export const retrievalNode = async (
  state: SupportState,
): Promise<SupportState> => {
  console.log("\nRUNNING RETRIEVAL NODE");
  const queryEmbedding = await generateEmbedding(state.query);

  // Make use of this query embeddings to perform search operation in the vector DB
  const results = await qdrant.search("support-docs", {
    vector: queryEmbedding,
    limit: 3,
  });


  const retrievedDocs = results.map((result) => ({
    score: result.score,
    content: result.payload?.content,
  }));

  return {
    ...state,
    retrievedDocs,
    currentNode: "retrieval",
  };
};
