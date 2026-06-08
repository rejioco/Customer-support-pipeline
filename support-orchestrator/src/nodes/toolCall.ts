// This node that will actually call the tool
import { SupportState } from "../state.js";

// Importing tools
import {
  getCustomerDetails,
  getOrderDetails,
  getOrderStatus,
  issueRefund,
  updateAddress,
} from "../tools/orderTools.js";


const TOOL_MAP = {
  getOrderStatus: getOrderStatus,
  issueRefund: issueRefund,
  updateAddress: updateAddress,
  getOrderDetails:getOrderDetails,
  getCustomerDetails:getCustomerDetails
};

type ToolName = keyof typeof TOOL_MAP;

type ToolDecision = {
  toolName: ToolName;
  toolInput: string;
};

export const toolCallNode = async (state: SupportState) => {
  console.log("\nRUNNING TOOL EXECUTION NODE");
  const toolName = state.toolName as ToolName;
  const toolInput = state.toolInput;
  const toolResponse = await TOOL_MAP[toolName](toolInput)
  state.observations.push({
    toolName:toolName,
    input:toolInput!,
    output:toolResponse
  })
  return { ...state, toolResponse };
};












// // This node that will actually call the tool
// import { SupportState } from "../state.js";
// import { Ollama } from "ollama";

// // Importing tools
// import { getOrderStatus, getRefundStatus } from "../tools/orderTools.js";

// const ollama = new Ollama({ host: "http://localhost:11434" });

// const SYSTEM_PROMPT = `

// `;

// const TOOL_MAP = {
//   getOrderStatus: getOrderStatus,
//   getRefundStatus: getRefundStatus,
// };

// type ToolName = keyof typeof TOOL_MAP;

// type ToolDecision = {
//   toolName: ToolName;
//   toolInput: string;
// };

// export const toolCallNode = async (
//   state: SupportState,
// ): Promise<SupportState> => {
//   console.log("\nRUNNING TOOL EXECUTION NODE");
//   const query = state.query;
//   const intent = state.intent;
//   const CONVO_HISTORY = JSON.stringify(state.messages);
//   const response = await ollama.chat({
//     model: "llama3.1:latest",
//     messages: [
//       {
//         role: "system",
//         content: `You are a tool calling agent that calls the tool
//         You have available tools like:
//         - getOrderStatus(orderId) - Fetches real-time order tracking and delivery status. Required Input: orderId
//         - getRefundStatus(refundId) - returns the status of refund

//         - This is conversational history and its very importany for you to first have a look in this : ${CONVO_HISTORY}
//         - Based on user query decide which tool to call from available tools and the tool Input that needs to be passed into the tool

//         - Do not any explanation
//         - Do not return Markdown
//         - Return only valid JSON output

//         - Return the output is this format only:
//       {
//         "toolName":"Name of the tool",
//         "toolInput":"Inputs to be passed into tool"
//       }`,
//       },
//       {
//         role: "user",
//         content: state.query,
//       },
//     ],
//   });
//   const raw = response.message.content;
//   const parsed: ToolDecision = JSON.parse(raw);
//   const toolName = parsed.toolName;
//   const toolInput = parsed.toolInput;
//   const toolResponse = await TOOL_MAP[toolName](toolInput);

//   return { ...state, toolName, toolInput, toolResponse };
// };
