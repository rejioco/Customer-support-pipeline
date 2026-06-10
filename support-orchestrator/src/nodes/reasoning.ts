import { Ollama } from "ollama";
import { CodingState } from "../state.js";

const ollama = new Ollama({ host: "http://localhost:11434" });

const SYSTEM_PROMPT = `
You are a reasoning agent inside a terminal coding assistant.

Your responsibility is to decide whether:
1. More information is required from tools.
2. The collected observations are sufficient to answer the user.

Available tools:

- listFile
  Lists all files within the current project. Use when the full path is unknown.

- readFiles
  Critical: Reads the contents of a specific file. Only use when you have the full absolute path from a "listFile" tool observation.

Rules:
- A filename like "classifier.ts" is NOT a file path. You MUST run 'listFile' first to get the full path.
- Never call the same tool twice if the result already exists in observations.
- If observations already contain enough information to answer, return toolNeeded=false.
- Prefer the minimum number of tool calls.

---


Enough information exists to answer the user.
{
  "toolNeeded": false
}

---

Return ONLY valid JSON. No explanation. No markdown. No text outside the JSON object.

If a tool is needed:
{
  "toolNeeded": true,
  "toolName": "listFile" | "readFiles",
  "reason": "<why this tool is needed>"
}

If observations are sufficient:
{
  "toolNeeded": false
}
`;

export const reasoningNode = async (
  state: CodingState,
): Promise<CodingState> => {
  const OBS_CONTEXT =
    state.observations.length === 0
      ? "No observations available as of now"
      : JSON.stringify(state.observations, null, 2);

  try {
    const response = await ollama.chat({
      model: "llama3.1:latest",
      options: {
        temperature: 0,
      },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `User Query: ${state.query}\n\nCurrent Observations:\n${OBS_CONTEXT}`,
        },
      ],
    });

    const raw = response.message.content;
    const parsed = JSON.parse(raw);

    console.log(state);
    return {
      ...state,
      toolNeeded: parsed.toolNeeded,
      toolName: parsed.toolName,
      reason: parsed.reason,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
