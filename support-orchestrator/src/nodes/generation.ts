//This is my generation node => we make use of user query and retrieved documents to
import { Ollama } from "ollama";
import { SupportState } from "../state";

const ollama = new Ollama({ host: "http://localhost:11434" });

export const generationNode = async (
  state: SupportState,
): Promise<SupportState> => {
  console.log("GENERATION NODE IS RUNNING\n");
  const RETRIEVED_CONTEXT =
    state.retrievedDocs
      ?.map((doc) => {
        return doc.content;
      })
      .join("\n") ?? "";

  const TOOL_CONTEXT = state.toolResponse
    ? JSON.stringify(state.toolResponse, null, 2)
    : "No tool response available";

  const SYSTEM_PROMPT = `
  You are an AI customer support assistant.

  You will receive:

  1. Retrieved Context (company policies and documentation)
  2. Tool Results (live operational data)
  3. User Query

  Use:
  - Retrieved Context for informational answers
  - Tool Results for real-time order/account information

  -------------------------

  RETRIEVED CONTEXT:
  ${RETRIEVED_CONTEXT}

  -------------------------

  TOOL RESULTS:
  ${TOOL_CONTEXT}

  -------------------------

  RULES:
  - Prefer tool results when available.
  - Do not hallucinate.
  - Keep response concise and professional.
  - Return ONLY valid JSON.

  Return format:

  {
    "reply":"your response"
  }
  `;

  const response = await ollama.chat({
    model: "llama3.1:latest",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: state.query,
      },
    ],
  });

  const raw = response.message.content;
  const parsed = JSON.parse(raw);

  state.finalResponse = parsed.reply;
  state.currentNode = "generation";

  return state;
};
