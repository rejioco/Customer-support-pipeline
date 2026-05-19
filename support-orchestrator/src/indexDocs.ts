// - Documents
// - The embedding function

import { docs } from "./data/docs";
import { qdrant } from "./qdrant";
import { generateEmbedding } from "./embed";

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
