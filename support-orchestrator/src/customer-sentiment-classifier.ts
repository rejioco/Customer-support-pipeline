import { Ollama } from "ollama";
import { z } from "zod";

const ollama = new Ollama({ host: "http://localhost:11434" });

// ==================== AGENTS ======================
// An agent takes the user query to do its task

// Billing agent
const billingAgent = async (query: string) => {
  return `Billing agent handled the user query👉🏻 ${query}`;
};

// Shipping agent
const shippingAgent = async (query: string) => {
  return `Shipping agent handled the user query👉🏻 ${query}`;
};

// After_sales agent
const afterSalesAgent = async (query: string) => {
  return `After sales agent handled the user query👉🏻 ${query}`;
};

// Technical agent
const technicalAgent = async (query: string) => {
  return `Technical agent handled the user query👉🏻 ${query}`;
};

// Account agent
const accountAgent = async (query: string) => {
  return `Account agent handled the user query👉🏻 ${query}`;
};

// Misc agent
const miscAgent = async (query: string) => {
  return `Misc agent handled the user query👉🏻 ${query}`;
};
// ==============================================

// ==================== ROUTER ====================
// Router is like a root node with all other agents as its leaf node
// Based on intent it will pass the user query to the specific router
const router = (intent: string, query: string) => {
  if (intent === "billing") {
    return billingAgent(query);
  } else if (intent === "shipping") {
    return shippingAgent(query);
  } else if (intent === "after_sales") {
    return afterSalesAgent(query);
  } else if (intent === "technical") {
    return technicalAgent(query);
  } else if (intent === "account") {
    return accountAgent(query);
  } else {
    return miscAgent(query);
  }
};

const SYSTEM_PROMPT = `
You are a custormer support classifier
Analyze the user's message
Return a valid JSON

Valid intent: 
- billing
- shipping
- after_sales
- technical
- account
- miscelleneous

Valid sentiment:
- positive
- neutral
- negative

Confidence calculation rules:
- User query is expl icit, detailed and unambigous:
    confidence between 0.8-1
- User query is clear but lacks details:
    confidence between 0.5-0.8
- User query is vague, ambigous or missing context:
    confidence between 0.0-0.5

Required JSON format: 
{
    "intent":"billing",
    "sentiment":"neutral",
    "confidence":0.95
}
Do not any explanation
Do not return Markdown
Return only valid JSON output

`;

const USER_QUERY = "I can't log in";

// Valid structure for Classifier output
const ClassificationSchema = z.object({
  intent: z.enum([
    "billing",
    "shipping",
    "after_sales",
    "technical",
    "account",
    "miscellaneous",
  ]),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  confidence: z.number().min(0).max(1),
});

const main = async () => {
  try {
    const response = await ollama.chat({
      model: "llama3.1:latest",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: USER_QUERY,
        },
      ],
    });

    const raw = response.message.content;
    const parsed = JSON.parse(raw);
    const validated = ClassificationSchema.parse(parsed);

    // MAKE USE OF THE VALIDATED OUTPUT TO CALL THE SPECIFIC AGENT => DEPENDS ON INTENT
    const res = await router(validated.intent,USER_QUERY);
    console.log(res);
    // console.log(validated);
  } catch (err) {
    console.error("Parsing error ", err);
  }
};

main();
