import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "http://localhost:11434",
});

export const generateEmbedding = async (text: string) => {
  const response = await ollama.embed({
    model: "nomic-embed-text",
    input: text,
  });

  return response.embeddings[0];
};
