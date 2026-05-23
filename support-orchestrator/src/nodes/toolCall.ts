// This node that will actually call the tool
import { SupportState } from "../state";
import { Ollama } from "ollama";

// Importing tools
import { getOrderStatus, getRefundStatus } from "../tools/orderTools";

const ollama = new Ollama({ host: "http://localhost:11434" });

const SYSTEM_PROMPT = `You are a tool calling agent that calls the tool
You have available tools like:
- getOrderStatus(orderId) - Fetches real-time order tracking and delivery status. Required Input: orderId
- getRefundStatus(refundId) - returns the status of refund

- Based on user query decide which tool to call fro available tools and the tool Input that needs to be passed into the tool

- Do not any explanation
- Do not return Markdown
- Return only valid JSON output

- Return the output is this format only:
{
  "toolName":"Name of the tool",
  "toolInput":"Inputs to be passed into tool"
}

`;

const TOOL_MAP = {
  getOrderStatus: getOrderStatus,
  getRefundStatus: getRefundStatus,
};

type ToolName = keyof typeof TOOL_MAP;

type ToolDecision = {
  toolName: ToolName;
  toolInput: string;
};

export const toolCallNode = async (state: SupportState): Promise<SupportState> => {
  console.log("\nRUNNING TOOL EXECUTION NODE");
  const query = state.query;
  const intent = state.intent;
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
  const parsed: ToolDecision = JSON.parse(raw);
  const toolName = parsed.toolName;
  const toolInput = parsed.toolInput;
  const toolResponse = await TOOL_MAP[toolName](toolInput);

  return {...state,toolName,toolInput,toolResponse}
};
