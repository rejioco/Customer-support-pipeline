import { SupportState } from "./state";

export const routerAfterEscalation = (state: SupportState): string => {
  if ((state.confidence || 0) < 0.5) {
    // Escalation
    return "escalation";
  }
  // Retrieval
  return "retrieval";
};

export const routerAfterRetrieval = (state:SupportState): string => {
  if(state.toolNeeded){
    //tool node 
    return "tool"
  }
  // Direct generation node
  return "generation"
}