import { SupportState } from "../state";
import { generateEmbedding } from "../embed";
import { qdrant } from "../qdrant";

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
