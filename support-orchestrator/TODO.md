# TODO: Human-in-the-loop support orchestration

## Plan summary

Implement a “pause for human/customer decision” step in the pipeline so that certain tool actions (e.g., refund initiation, address changes) are gated behind a user confirmation collected via API/Redis, while preserving Redis-based low latency.

## Steps

1. Inspect current pipeline flow (runPipeline, toolDecide, toolCall, router) and identify where to insert a human decision gate.
2. Add a new node: `humanDecisionNode` that:
   - Detects when a tool action requires confirmation.
   - Produces a `pendingHumanAction` payload (what will happen + options).
   - Persists pipeline state in Redis under a session key.
   - Returns early with a “waiting” response (so the pipeline doesn’t continue automatically).
3. Add an API endpoint to receive the human decision (e.g., `POST /decision`) and resume the pipeline from the stored state.
4. Update `runPipeline` to support resuming: if `state.currentNode` indicates a pending human action, skip directly to tool execution after confirmation.
5. Update `server.ts` and/or UI code to return the pending action to the customer and send confirmation back.
6. Add minimal tests or a dry-run command to validate:
   - Pipeline pauses at the right time (only high-impact tools initially).
   - Pipeline resumes and executes the selected tool.
   - Redis state remains consistent.
