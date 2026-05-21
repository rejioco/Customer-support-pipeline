import { SupportState } from "./state";

import { classificationNode } from "./nodes/classifier";

import { retrievalNode } from "./nodes/retrieval";

import { responseNode } from "./nodes/response";
import { routerAfterEscalation, routerAfterRetrieval } from "./router";
import { escalationNode } from "./nodes/escalation";
import { generationNode } from "./nodes/generation";
import { toolDecisonNode } from "./nodes/toolDecide";
import { toolCallNode } from "./nodes/toolCall";

const main = async () => {
  let state: SupportState = {
    query:"What is the order status of my order ORD4565",
    currentNode: "start",
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
    state = await toolDecisonNode(state);
    console.log("Ye dekh: ");
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
  console.log(state);
};

main();
