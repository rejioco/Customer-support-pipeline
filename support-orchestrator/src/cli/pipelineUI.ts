import ora from "ora";

export const pipeLineUI = {
  classification: ora("Classification"),
  retrieval: ora("Retrieval"),
  validation: ora("Validation"),
  toolDecision: ora("Tool Decision"),
  toolCall: ora("Tool Call"),
  generation: ora("Generation"),
};

export const codeLineUI = {
  reasoning: ora("Reasoning"),
  tool_call: ora("Calling tools"),
  generation: ora("Generating"),
};
