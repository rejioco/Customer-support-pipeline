import { SupportState } from "../state";

export const responseNode = async (state:SupportState): Promise<SupportState>=> {
    console.log("\nRunning Response Node");
    state.finalResponse = `Intent Detected: ${state.intent} Relevant Docs: ${state.retrievedDocs?.join("\n")}`
    state.currentNode="response";
    return state
}