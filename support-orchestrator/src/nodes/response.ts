import { SupportState } from "../state";

export const responseNode = async (state:SupportState): Promise<SupportState>=> {
    console.log("\nRunning Response Node");
    const content = state.retrievedDocs?.map((doc)=>{
        return doc.content
    }).join("\n");
    state.finalResponse = state.finalResponse
    state.currentNode="response";
    return state
}