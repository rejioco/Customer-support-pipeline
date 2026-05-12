import { Ollama } from "ollama";
import { SupportState } from "../state";

const ollama = new Ollama({ host: "http://localhost:11434" });

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

export const classificationNode = async (
  state: SupportState,
): Promise<SupportState> => {
  console.log("\nRUNNING CLASSIFICATION NODE");
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

  state.intent = parsed.intent;
  state.sentiment = parsed.sentiment;
  state.confidence = parsed.confidence;
  state.currentNode = "classification";

  return state;
};
