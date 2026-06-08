// Pipeline for my coding agent
import { codeLineUI } from "./cli/pipelineUI.js";
import { codeToolCallNode } from "./nodes/codeTool.js";
import { generateNode } from "./nodes/generate.js";
import { reasoningNode } from "./nodes/reasoning.js";
import { CodingState } from "./state.js";
import { Ollama } from "ollama";

export const executePipeline = async (query:string,messages:any[],observations:any[]):Promise<CodingState> => {

    let state:CodingState= {
        query:query,
        messages,
        observations
    }

    let i = 0;
    while(i<10){
        // Call reasoning node 
        codeLineUI.reasoning.start();
        state = await reasoningNode(state);
        codeLineUI.reasoning.succeed("Reasoning done...")
        // If reasoning node => toolNeeeded:false come out of this loop
        if(!state.toolNeeded){
            break;
        }
    // run toolNode 
        codeLineUI.tool_call.start();
        state = await codeToolCallNode(state);
        codeLineUI.tool_call.succeed("Tool Calling done...")
        i++;
    }
    codeLineUI.generation.start();
    state = await generateNode(state);
    codeLineUI.generation.succeed("Generation done...")
    return state
}


executePipeline("What is the content of hello.txt",[],[])