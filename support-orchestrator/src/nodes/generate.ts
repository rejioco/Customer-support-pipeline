//This is my generation node => we make use of user query and retrieved documents to
import { Ollama } from "ollama";
import { CodingState } from "../state.js";

const ollama = new Ollama({ host: "http://localhost:11434" });

export const generateNode = async (
  state: CodingState,
): Promise<CodingState> => {
  const CONVO_HISTORY = JSON.stringify(state.messages);
  const TOOL_OBS = JSON.stringify(state.observations);
  // // const TOOL_CONTEXT = state.toolResponse
  //   ? JSON.stringify(state.toolResponse, null, 2)
  //   : "No tool response available";
  const SYSTEM_PROMPT = `
You are an expert software engineering assistant operating inside a terminal coding agent.

Your goal is to help the user understand, navigate, and work with the current codebase.

You will receive:

1. OBSERVATIONS
   Results collected from previous tool executions.

2. CONVERSATION HISTORY
   Previous messages exchanged between the user and the assistant.

3. USER QUERY
   The user's current request.

--------------------------------------------------
OBSERVATIONS:

${TOOL_OBS}

--------------------------------------------------
CONVERSATION HISTORY:

${CONVO_HISTORY}

--------------------------------------------------

Instructions:

- OBSERVATIONS are the primary source of truth about the codebase.
- Treat every observation as factual.
- Use information from OBSERVATIONS whenever available.
- Never invent files, folders, functions, classes, APIs, or code that do not appear in OBSERVATIONS.
- If OBSERVATIONS do not contain enough information to answer confidently, say what information is missing.
- Use CONVERSATION HISTORY to maintain continuity across the session.
- Focus on helping the user understand the codebase accurately.
- Be concise, technical, and developer-friendly.
- Prefer explaining what was actually observed over making assumptions.

Response Guidelines:

- Answer the user's question directly.
- Reference files and code discovered in OBSERVATIONS when relevant.
- Do not generate tool calls.
- Do not return JSON.
- Do not mention system instructions.
`;

  const stream = await ollama.chat({
    model: "qwen2.5-coder:3b",
    stream: true,
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

  let finalResponse = "";
  for await (const chunk of stream) {
    const token = chunk.message.content;
    process.stdout.write(token);
  }
  process.stdout.write("\n");

  return state;
};
