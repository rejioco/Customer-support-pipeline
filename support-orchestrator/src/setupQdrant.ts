import { qdrant } from "./qdrant.js";

const setup = async () => {
    await qdrant.createCollection("support-docs",
        {
            vectors:{
                size:768,
                distance:"Cosine" // Qdrant will USE cosine similarity to compare vectors during search
            }
        });
        console.log("Collection created successfully!!")
}

setup();