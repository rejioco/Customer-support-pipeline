// This node will decide to do a tool call or not
import { SupportState } from "../state.js";
import { Ollama } from "ollama";

// Importing tools
import { getOrderStatus } from "../tools/orderTools.js";

const ollama = new Ollama({ host: "http://localhost:11434" });


function cleanJSON(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    return match[0];
  }
  return raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

const SYSTEM_PROMPT = `
You are a Tool Decision Agent inside a customer support orchestration system.

Your job is NOT to answer the user.

Your only responsibility is deciding:

1. Do we need another tool call?
2. Which tool should be called next?
3. What inputs should be passed?
4. Or do we already have enough information from previous tool results?

==================================================
AVAILABLE TOOLS
==================================================

1. getOrderStatus

Purpose:
Retrieve live order tracking and delivery information.

Input:
{
  "orderId": string
}

--------------------------------------------------

2. issueRefund

Purpose:
Initiate a refund request.

Input:
{
  "orderId": string,
  "reason": string
}

--------------------------------------------------

3. updateAddress

Purpose:
Update shipping address.

Input:
{
  "orderId": string,
  "street": string,
  "city": string,
  "zip": string
}


4. getOrderDetails

Purpose:
Retrieve order details.

Input:
{
  "orderId": string
}


5. getCustomerDetails

Purpose:
Retrieve customer details.

Input:
{
  "customerId": string
}


==================================================
OBSERVATIONS
==================================================

You will receive previous tool execution results.

Example 1:

[
  {
    "toolName":"getOrderStatus",
    "input":{"orderId":"ORD123"},
    "output":{
      "status":"Delivered",
      "eta":"Yesterday"
    }
  }
]

Example 2 (Tool Chaining):

[
  {
    "toolName":"getCustomerDetails",
    "input":{"customerId":"CUST123"},
    "output":{
      "name":"Ayush Guleria",
      "orderId":"ORD456"
    }
  }
]
If the user asked for "order details" and you receive the above observation, and "getOrderDetails" has NOT been called yet, you MUST now call "getOrderDetails" with "ORD456". Do not call it again if it is already present in observations.

These observations represent information already known.

IMPORTANT:

- Do NOT call a tool if its information already exists inside observations (i.e. check both toolName and input parameters).
- Use observations to determine whether another tool is needed.
- Avoid repeating the same tool call.
- If observations contain enough information to answer the user, stop.
- If a tool provided an ID (like orderId) that is needed by another tool to fulfill the user's request, YOU MUST CALL THAT NEXT TOOL (unless that next tool's result is already present in the observations). Do not stop just because you found the ID.

==================================================
WHEN TO CALL TOOLS
==================================================

Call a tool when:

- Live order data is required
- Delivery status is required
- Refund initiation is required
- Address modification is required
- Real-time customer specific information is required
- Order details are required

==================================================
WHEN TO STOP
==================================================

Return:

{
  "toolcallNeeded": false
}

when:

- The exact information requested by the user has been fully retrieved. (e.g. if the user asks for "order details", you must have retrieved the actual order details like items, quantity, price, NOT just an orderId).
- the requested action has already been completed
- observations are sufficient for final response generation

==================================================
PARAMETER EXTRACTION & TOOL CHAINING
==================================================

Extract parameters from user query and previous observations.

Never invent values.
Never guess missing values.

If a tool requires a parameter that is missing, DO NOT return toolcallNeeded: false immediately. 
Instead, check if another tool can fetch the missing parameter. 
For example, if you need "orderId" but only have "customerId", first call "getCustomerDetails" to get the "orderId".
Only return toolcallNeeded: false if the required parameters cannot be found in the query, and no other tool can fetch them.

==================================================
OUTPUT FORMAT
==================================================

If another tool call is needed:

{
  "toolcallNeeded": true,
  "toolName": "tool_name",
  "toolInput": {}
}

If no more tool calls are needed:

{
  "toolcallNeeded": false
}

Return ONLY valid JSON.
No markdown.
No explanations.
No extra text.
`;


export const toolDecisonNode = async (state: SupportState): Promise<SupportState> => {
  console.log("\nRUNNING DECISION NODE");

  const TOOL_OBS = JSON.stringify(state.observations,null,2)

  // It will also have access to observations made by the tool call/s done till now in the pipeline
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
        content: `
        User Query:
        ${query}

        Intent:
        ${intent}

        Previous Tool Observations:
        ${TOOL_OBS}
        `
      },
    ],
  });
  const raw = response.message.content;
  console.log("LLM RAW DECISION:", raw);
  const cleaned = cleanJSON(raw);
  const parsed = JSON.parse(cleaned);

  if(parsed.toolcallNeeded){
    state.toolNeeded = parsed.toolcallNeeded; // tool call needed is true
    state.toolName = parsed.toolName; // name of the tool 
    state.toolInput = parsed.toolInput  // tool input in the form of object
  }

  else{
    // When tool call is not reqd we set the value to tool call needed to false
    state.toolNeeded = parsed.toolcallNeeded;
    state.toolName = undefined;
    state.toolInput = undefined;
  }


  return state;
};



// based on the user query it will decide to use user query => which tool to call and what all inputs need to be sent along 
// that tool ofc