import { SupportState } from "./state.js";
import { classificationNode } from "./nodes/classifier.js";
import { retrievalNode } from "./nodes/retrieval.js";
import { responseNode } from "./nodes/response.js";
import { routerAfterEscalation, routerAfterRetrieval } from "./router.js";
import { escalationNode } from "./nodes/escalation.js";
import { generationNode } from "./nodes/generation.js";
import { toolDecisonNode } from "./nodes/toolDecide.js";
import { toolCallNode } from "./nodes/toolCall.js";
import { retrievalValidationNode } from "./nodes/retrievalValidator.js";
import { pipeLineUI } from "./cli/pipelineUI.js";

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
    observations: [],
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
  pipeLineUI.classification.succeed(
    `Classification (${state.metrics?.classificationLatencyMs}) ms`,
  );

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
    pipeLineUI.retrieval.succeed(
      `Retrieval (${state.metrics?.retrievalLatencyMs}) ms`,
    );

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
    pipeLineUI.validation.succeed(
      `Retrieval Validation (${state.metrics?.retrievalValidationLatencyMs}) ms`,
    );

    if (!state.retrievalValid) {
      return await escalationNode(state);
    }

    // ----------------------------------------------------------------

    let i = 0;

    while (i < 5) {
      const toolDecisionStart = Date.now();

      state = await toolDecisonNode(state);

      state.metrics = {
        ...state.metrics,
        toolDecisionLatencyMs:
          (state.metrics?.toolDecisionLatencyMs || 0) +
          (Date.now() - toolDecisionStart),
      };

      if (!state.toolNeeded) {
        break;
      }

      const toolCallStart = Date.now();

      state = await toolCallNode(state);

      state.metrics = {
        ...state.metrics,
        toolCallLatencyMs:
          (state.metrics?.toolCallLatencyMs || 0) +
          (Date.now() - toolCallStart),
      };

      i++;
    }

    // ----------------------------------------------------------------

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
    pipeLineUI.generation.succeed(
      `Generation (${state.metrics?.generationLatencyMs}) ms`,
    );
    state = await responseNode(state);
  } else {
    state = await escalationNode(state);
  }

  state = {
    ...state,
    metrics: {
      ...state.metrics,
      totalLatencyMs: (Date.now() - pipelineStartTime) / 1000,
    },
  };
  console.log(`\nTotal Latency: ${state.metrics?.totalLatencyMs} s`);
  // console.log("\nFINAL STATE");
  return state;
};
