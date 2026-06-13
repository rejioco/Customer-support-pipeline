import {generateText} from "ai"
import {google} from "@ai-sdk/google"
 
import { SupportState } from "../state.js";
import { z } from "zod";
import { escalationNode } from "./escalation.js";
import { groq } from "@ai-sdk/groq";


const ResposeSchema = z.object({
  intent: z.string(),
  sentiment: z.string(),
  confidence: z.number().min(0).max(1),
});

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
- User query is explicit, detailed and unambiguous:
    Calculate points: Intent clarity (0.4) + Specific details (0.4) + Conversational independence (0.2)
    confidence between 0.8-1.0
- User query is clear but lacks details:
    Calculate points: Intent clarity (0.4) + Missing details (0.1) + Conversational independence (0.2)
    confidence between 0.5-0.8
- User query is vague, ambiguous or missing context:
    Calculate points: Vague intent (0.1) + Missing details (0.1) + Context dependent (0.0)
    confidence between 0.0-0.5



Required JSON format: 
{
    "intent":"billing",
    "sentiment":"negative",
    "confidence":0.95
}
Do not any explanation
Do not return Markdown
Return only valid JSON output
`;

export const classificationNode = async (
  state: SupportState,
): Promise<SupportState> => {
  console.log(`\nRUNNING CLASSIFICATION NODE (Retry: ${state.retryCount})`);
    let raw = "";
    try {
      const response = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system:state.retryCount > 0
                ? SYSTEM_PROMPT +
                  `\nPrevious output was invalid please return valid JSON follow this formaat: 
                  {
                      "intent":"billing",
                      "sentiment":"neutral",
                      "confidence":0.95
                  }`
                : SYSTEM_PROMPT,
        messages: [
  
          {
            role: "user",
            content: state.query,
          },
        ],
      });
      raw = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(raw);
      const validateParsed = ResposeSchema.parse(parsed);
  
      return {
        ...state,
        intent: validateParsed.intent,
        sentiment: validateParsed.sentiment,
        confidence: validateParsed.confidence,
        currentNode: "Classification",
      };
    } catch (err) {
      console.log("\nCLASSIFICATION NODE FAILED", err, "RAW:", raw);
  
      const updatedState = {
        ...state,
        retryCount: (state.retryCount || 0) + 1,
        lastFailure: "CLASSIFICATION_VALIDATION_FAILED",
      };

    if (updatedState.retryCount >= 2) {
      console.log("MAX RETRIES REACHED → ESCALATING");
      return await escalationNode(updatedState);
    }
    console.log("RETRYING CLASSIFICATION NODE");

    return await classificationNode(updatedState);
  }
};
