// This node will decide to do a tool call or not
import { SupportState } from "../state";
import { Ollama } from "ollama";

// Importing tools
import { getOrderStatus } from "../tools/orderTools";

const ollama = new Ollama({ host: "http://localhost:11434" });

const SYSTEM_PROMPT = `
You are a Tool Decision Agent inside a customer support orchestration system.

Your job is to decide whether the user query requires a real-time tool call.

A tool call is required when:
- the user asks for live order status
- the user asks for tracking information
- the user asks about delivery updates
- the user asks about refund status
- the user asks for account/order specific information

A tool call is NOT required when:
- the user asks general policy questions
- the user asks informational questions
- the question can be answered from retrieved documents

RULES:
- If the query contains an order ID or asks for order status/tracking, return true.
- Return ONLY valid JSON.
- Do NOT explain anything.
- Do NOT return markdown.

Return format:

{
  "toolcallNeeded": true
}

OR

{
  "toolcallNeeded": false
}
`;


export const toolDecisonNode = async (state: SupportState): Promise<SupportState> => {
  console.log("\nRUNNING DECISION NODE");
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
        content: query+intent ,
      },
    ],
  });
  const raw = response.message.content;
  const parsed = JSON.parse(raw);

  if(parsed.toolcallNeeded){
    state.toolNeeded = parsed.toolcallNeeded
  }

  else{
    state.toolNeeded = parsed.toolcallNeeded;
  }


  return state;
};
