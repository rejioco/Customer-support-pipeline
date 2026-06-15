//This is my generation node => we make use of user query and retrieved documents to
import { SupportState } from "../state.js";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const generationNode = async (
  state: SupportState,
): Promise<SupportState> => {
  console.log("GENERATION NODE IS RUNNING\n");
  const RETRIEVED_CONTEXT =
    state.retrievedDocs
      ?.map((doc) => {
        return doc.content;
      })
      .join("\n") ?? "";

  const TOOL_CONTEXT =
    state.observations && state.observations.length > 0
      ? JSON.stringify(state.observations, null, 2)
      : "No tool observations available";

  const MEMORY_CONTEXT =
    state.conversationMemory && state.conversationMemory.length > 0
      ? state.conversationMemory
          .map(
            (m) =>
              `[Past turn (relevance: ${m.score.toFixed(2)})]\nUser: ${m.query}\nAssistant: ${m.response}`,
          )
          .join("\n\n")
      : "No relevant past interactions found";

  const SYSTEM_PROMPT = `
  You are an AI customer support assistant.

  You will receive:

  1. Retrieved Context (company policies and documentation)
  2. Tool Results (live operational data)
  3. Relevant Past Interactions (semantically matched memory from previous sessions)
  4. Conversation History (ordered messages from this session)
  5. User Query

  Use:
  - Retrieved Context for informational answers
  - Tool Results for real-time order/account information
  - Relevant Past Interactions to recall what was discussed in earlier sessions
  - Conversation History to maintain context within this session

  -------------------------

  RETRIEVED CONTEXT:
  ${RETRIEVED_CONTEXT}

  -------------------------

  TOOL RESULTS:
  ${TOOL_CONTEXT}

  -------------------------

  RELEVANT PAST INTERACTIONS:
  ${MEMORY_CONTEXT}

  -------------------------

  RULES:
  - Prefer tool results when available.
  - Do not hallucinate, use conversation history and past interactions to stay in context.
  - Keep response concise and professional.
  - Return ONLY valid JSON.

  Return format:

  {
    "reply":"your response"
  }
  `;

  const response = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    messages: [
      ...(state.messages ?? []),
      {
        role: "user",
        content: state.query,
      },
    ],
  });

  const raw = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { reply: raw };
  }

  state.finalResponse = parsed.reply;
  state.currentNode = "generation";

  return state;
}