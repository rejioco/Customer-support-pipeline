import { SupportState } from "./state.js";

export const routerAfterEscalation = (state: SupportState): string => {
  if ((state.confidence || 0) < 0.5) {
    // Escalation
    return "escalation";
  }
  // Retrieval
  return "retrieval";
};


export const routerAfterRetrieval = (state:SupportState): string => {
  if(!state.toolNeeded){
    return "generation"
  }
  return "tool"
}