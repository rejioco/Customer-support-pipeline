// - Documents
// - The embedding function

import { docs } from "./data/docs.js";
import { qdrant } from "./qdrant.js";
import { generateEmbedding } from "./embed.js";

const indexDocs = async () => {
  for (const doc of docs) {
    console.log(`Indexing ${doc.id}`);

    const embeddings = await generateEmbedding(doc.content);

    // Now we want to store these embedding in out DB
    await qdrant.upsert("support-docs", {
      wait: true,
      points: [
        {
          id: doc.id,
          vector: embeddings,
          payload: {
            content: doc.content,
          },
        },
      ],
    });
  }
  console.log("Indexing completed");
};

indexDocs();
