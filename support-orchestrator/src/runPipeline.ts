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
import { pipeLineUI } from "./cli/pipelineUI";

export const runPipeline = async (
  query: string,
  messages: any[],
): Promise<SupportState> => {
  const pipelineStartTime = Date.now();
  let state: SupportState = {
    query: query,
    currentNode: "start",
    retryCount: 0,
    messages,
  };
  // console.log("\nINITIAL STATE");
  // console.log(state);

  // CLASSIFICATION NODE IN ACTION
  pipeLineUI.classification.start();
  const classificationStartTime = Date.now();
  state = await classificationNode(state);
  state = {
    ...state,
    metrics: {
      ...state.metrics,
      classificationLatencyMs: Date.now() - classificationStartTime,
    },
  };
  pipeLineUI.classification.succeed(`Classification (${(state.metrics?.classificationLatencyMs)}) ms`)

  // We will be running nodes decision based :) => Based on confidence computed at classification node
  const nextStep = routerAfterEscalation(state);
  // console.log(nextStep);

  if (nextStep === "retrieval") {
    // RETRIEVAL NODE IN ACTION
    pipeLineUI.retrieval.start();
    const retrievalStartTime = Date.now();
    state = await retrievalNode(state);
    state = {
      ...state,
      metrics: {
        ...state.metrics,
        retrievalLatencyMs: Date.now() - retrievalStartTime,
      },
    };
    pipeLineUI.retrieval.succeed(`Retrieval (${state.metrics?.retrievalLatencyMs}) ms`)

    // RETRIEVAL VALIDATION NODE IN ACTION
    pipeLineUI.validation.start();
    const retrievalValidationStartTime = Date.now();
    state = await retrievalValidationNode(state);
    state = {
      ...state,
      metrics: {
        ...state.metrics,
        retrievalValidationLatencyMs: Date.now() - retrievalValidationStartTime,
      },
    };
    pipeLineUI.validation.succeed(`Retrieval Validation (${state.metrics?.retrievalValidationLatencyMs}) ms`)

    if (!state.retrievalValid) {
      return await escalationNode(state);
    }

    // TOOL DECISION NODE IN ACTION
    pipeLineUI.toolDecision.start();
    const toolDecisionStartTime = Date.now();
    state = await toolDecisonNode(state);
    // console.log(state);
    state = {
      ...state,
      metrics: {
        ...state.metrics,
        toolDecisionLatencyMs: Date.now() - toolDecisionStartTime,
      },
    };
    pipeLineUI.toolDecision.succeed(`Tool Decision (${state.metrics?.toolDecisionLatencyMs}) ms`)

    if (routerAfterRetrieval(state) === "tool") {
      // TOOL NODE IN ACTION
      pipeLineUI.toolCall.start();
      const toolNodeStart = Date.now();
      state = await toolCallNode(state);
      state = {
        ...state,
        metrics: {
          ...state.metrics,
          toolCallLatencyMs: Date.now() - toolNodeStart,
        },
      };
      pipeLineUI.toolCall.succeed(`Tool Call (${state.metrics?.toolCallLatencyMs}) ms`)
    }
    // GENERATION NODE IN ACTION
    pipeLineUI.generation.start();
    const generationNodeStart = Date.now();
    state = await generationNode(state);
    state = {
      ...state,
      metrics: {
        ...state.metrics,
        generationLatencyMs: Date.now() - generationNodeStart,
      },
    };
    pipeLineUI.generation.succeed(`Generation (${state.metrics?.generationLatencyMs}) ms`)
    state = await responseNode(state);
    
  } else {
    state = await escalationNode(state);
  }

  state = {...state,metrics:{...state.metrics,totalLatencyMs:(Date.now()-pipelineStartTime)/1000}}
  console.log(`\nTotal Latency: ${state.metrics?.totalLatencyMs} s`)
  // console.log("\nFINAL STATE");
  return state;
};
