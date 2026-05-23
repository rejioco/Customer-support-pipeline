import { SupportState } from "./state";

import { classificationNode } from "./nodes/classifier";

import { retrievalNode } from "./nodes/retrieval";

import { responseNode } from "./nodes/response";
import { routerAfterEscalation, routerAfterRetrieval } from "./router";
import { escalationNode } from "./nodes/escalation";
import { generationNode } from "./nodes/generation";
import { toolDecisonNode } from "./nodes/toolDecide";
import { toolCallNode } from "./nodes/toolCall";
import { retrievalValidationNode } from "./nodes/retrievalValidator";

export const runPipeline = async (query: string): Promise<SupportState> => {
  let state: SupportState = {
    query: query,
    currentNode: "start",
    retryCount: 0,
  };
  console.log("\nINITIAL STATE");
  console.log(state);

  // CLASSIFICATION NODE IN ACTION
  state = await classificationNode(state);

  // We will be running nodes decision based :) => Based on confidence computed at classification node
  const nextStep = routerAfterEscalation(state);
  console.log(nextStep);

  if (nextStep === "retrieval") {
    state = await retrievalNode(state);
    state = await retrievalValidationNode(state);
    if (!state.retrievalValid) {
      return await escalationNode(state);
    }
    state = await toolDecisonNode(state);
    console.log(state);
    if (routerAfterRetrieval(state) === "tool") {
      state = await toolCallNode(state);
    }
    state = await generationNode(state);
    state = await responseNode(state);
  } else {
    state = await escalationNode(state);
  }

  console.log("\nFINAL STATE");
  return state;
};
