// This is the retrieval validato
// If this node validates the retrieval => tool decision node
// If this node invalidates the retrieval => escalation node as there is no context to further generation

import {generateText} from "ai"
import {google} from "@ai-sdk/google"
import { SupportState } from "../state.js";
import { z } from "zod";
import { escalationNode } from "./escalation.js";
import { groq } from "@ai-sdk/groq";


const ResposeSchema = z.object({
  retrievalValid: z.boolean(),
  retrievalConfidence: z.number().min(0).max(1),
  reason: z.string(),
  toolCallNeededAfterRetrieval: z.boolean(),
});

const SYSTEM_PROMPT = `You are a retrieval evaluation agent.

Your task is to determine whether the retrieved documents strictly
contain sufficient relevant information to answer the user query.

Evaluate:
- relevance
- usefulness
- topical match

- Set "retrievalValid": true if EITHER the retrieved documents OR the conversation history contain sufficient information to answer the user's query.
- Set "retrievalValid": false ONLY if NEITHER the retrieved documents NOR the conversation history contain the required information.

- If the retrieved documents OR the conversation history contain all the necessary information to fully answer the query without any external tools, then:
  "toolCallNeededAfterRetrieval": false
- If a tool call is still required to fetch specific live data (like order status or account details) to fully answer the query, even after checking the retrieved documents and conversation history, then:
  "toolCallNeededAfterRetrieval": true

Return ONLY valid JSON:

{
  "retrievalValid": true,
  "retrievalConfidence": 0.92,
  "reason": "Retrieved documents contain relevant shipping information.",
  "toolCallNeededAfterRetrieval": true
}`;

export const retrievalValidationNode = async (state: SupportState) => {
  try {
    console.log("\nRUNNING RETRIEVAL VALIDATOR NODE");
    const query = state.query;
    const retrievedDocs = state.retrievedDocs;
    const conversationDocs = state.conversationMemory;
    const relevantDocs = retrievedDocs?.filter((doc) => doc.score > 0.4);
    const relevantConvo = conversationDocs?.filter((doc) => doc.score > 0.5);
    const docsText = relevantDocs?.map((doc) => doc.content).join("\n\n") || "";
    const convoHistory = relevantConvo?.map((doc) => `User: ${doc.query} Assistant: ${doc.response}`).join("\n\n") || "";
    if (relevantDocs?.length === 0) {
      // Escalate to escalation node
      return {
        ...state,
        retrievalValid: false,
        retrievalConfidence: 0,
        reason: "No relevant documents found",
      };
    }

    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system:SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `USER QUERY:${query} RETRIEVED DOCS: ${docsText} CONVERSATION HISTORY: ${convoHistory} `,
        },
      ],
    });
    const raw = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(raw);
    const validParsed = ResposeSchema.parse(parsed);

    return {
      ...state,
      retrievalValid: validParsed.retrievalValid,
      retrievalConfidence: validParsed.retrievalConfidence,
      reason: validParsed.reason,
      toolCallNeededAfterRetrieval: validParsed.toolCallNeededAfterRetrieval
    };
  } catch (err) {
    console.log("\nRETRIEVAL NODE FAILED LACK OF RELEVENT DOCS -> ESCALATING", err);
    const updatedState = {
      ...state,
      lastFailure: "NO_RELEVANT_FAILED",
    };
    return await escalationNode(updatedState);
  }
};
