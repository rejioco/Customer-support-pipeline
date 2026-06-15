// This node that will actually call the tool
import { SupportState } from "../state.js";
import { v4 as uuidv4 } from "uuid";
import { toolRegistry } from "../tools/registry.js";
import { redisClient } from "../config/redis.js";


export const toolCallNode = async (state: SupportState) => {
  console.log("\nRUNNING TOOL EXECUTION NODE");
  const toolName = state.toolName as keyof typeof toolRegistry;
  const toolInput = state.toolInput;
  if (!toolName || !toolRegistry[toolName]) {
    console.error(`Error: Tool "${toolName}" is not registered in toolRegistry.`);
    state.observations.push({
      toolName: toolName || "unknown",
      input: JSON.stringify(toolInput),
      output: `Error: Tool "${toolName}" is not registered/available.`,
    });
    return state;
  }
  if(toolRegistry[toolName].humanApprovalReqd && !state.humanApprovalApproved){
    state.humanApproval=true;
    state.toolNameHumanApproval = toolName;
    state.toolInputHumanApproval = toolInput;

    // Save this entire workflow inside redis
    const workflowId = uuidv4();
    state.workflowId = workflowId;
    console.log(workflowId);
    await redisClient.set(`workflow:${workflowId}`, JSON.stringify(state));
    // What does saving workflow mean => It means saving the state inside redis
    // We fetch that state 
    // If humanApproval:true => runPipeline(state)
    // If humanApproval:false => Go to escalation node
    console.log("\nWaiting for human approval.......");
    return state
  }
  state.humanApproval = false;
  state.humanApprovalApproved = false;
  const toolResponse = await toolRegistry[toolName].execute(toolInput);
  state.observations.push({
    toolName: toolName,
    input: toolInput!,
    output: toolResponse,
  });
  return { ...state, toolResponse };
};
