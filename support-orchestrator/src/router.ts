import { SupportState } from "./state";

export const routerAfterEscalation = (state: SupportState): string => {
  if ((state.confidence || 0) < 0.5) {
    // Escalation
    return "escalation";
  }
  // Retrieval
  return "retrieval";
};
