import { SupportState } from "../state";

//No vector Databases yet

export const retrievalNode = async (
  state: SupportState,
): Promise<SupportState> => {
  console.log("\nRUNNING RETRIEVAL NODE");
  const fakeDocs: Record<string, string[]> = {
    billing: [
      "Refunds take around 6-7 business days have some patience",
      "Double charges are usually reversed automatically",
    ],
    shipping: ["Orders usually arrive within 3-5 days"],
    technical: ["Restart your application before retrying"],
  };
  state.retrievedDocs = fakeDocs[state.intent || ""] || [];
  state.currentNode = "retrieval";
  return state;
};
