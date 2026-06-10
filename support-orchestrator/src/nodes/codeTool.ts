// This is my tool calling node
import { Ollama } from "ollama";
import { CodingState } from "../state.js";
import { listFile } from "../tools/listFiles.js";
import { readFiles } from "../tools/readFiles.js";

const ollama = new Ollama({ host: "http://localhost:11434" });

// This is my tool map
const TOOL_MAP = {
  listFile: listFile,
  readFiles: readFiles,
};

type ToolName = keyof typeof TOOL_MAP;

function cleanJSON(raw: string) {
  return raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

const ROOT = process.cwd();

const INPUT_PROMPT = `
You are a tool input agent inside a terminal coding assistant.

The tool to call has already been decided. Your ONLY job is to decide what input to pass to it.

Available tools:

- listFile(directoryPath)
  Returns all files and folders inside a project.
  Input must be an absolute directory path.

- readFiles(filePath)
  Returns the contents of a specific file.
  Input must be an absolute file path — taken from a previous listFile observation.
  NEVER invent or guess a file path. Only use paths that appear in observations.

Current workspace root: ${ROOT}

Return ONLY valid JSON in this format:
{
  "toolInput": "<input to pass to the tool>"
}

No explanation. No markdown. No text outside the JSON object.
`;

export const codeToolCallNode = async (
  state: CodingState,
): Promise<CodingState> => {
  // Tool is already decided by reasoningNode — never override it
  const toolName = state.toolName as ToolName;

  // For listFile, input is always the root — no LLM needed
  if (toolName === "listFile") {
    const toolResponse = TOOL_MAP["listFile"](ROOT);
    state.observations.push({
      toolName: "listFile",
      input: ROOT,
      output: JSON.stringify(toolResponse),
    });
    return state;
  }

  // For readFiles, ask LLM to pick the correct path from observations
  const response = await ollama.chat({
    model: "llama3.1:latest",
    options: { temperature: 0 },
    messages: [
      {
        role: "system",
        content: INPUT_PROMPT,
      },
      {
        role: "user",
        content: ` Tool to call: ${toolName} User Query: ${state.query} Observations (use these to find the correct file path): ${JSON.stringify(state.observations, null, 2)}`,
      },
    ],
  });

  const raw = response.message.content;
  const cleaned = cleanJSON(raw);

  let parsed: { toolInput: string };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`codeToolCallNode got unparseable response: ${raw}`);
  }

  const toolInput = parsed.toolInput;

  const toolResponse = await TOOL_MAP["readFiles"](toolInput);
  state.observations.push({
    toolName: "readFiles",
    input: toolInput,
    output: JSON.stringify(toolResponse),
  });

  console.log(state);

  return state;
};
