import { SupportState } from "../state.js";

export const escalationNode = async (state:SupportState): Promise<SupportState> => {
    console.log("\nRUNNING ESCALATION NODE");
    state.escalationNeeded=true;
    state.finalResponse="You have been escalated to human support agent";
    state.currentNode="escalation";
    return state;
}