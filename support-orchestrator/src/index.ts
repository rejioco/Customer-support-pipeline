import { SupportState } from "./state";

import { classificationNode } from "./nodes/classifier";

import { retrievalNode } from "./nodes/retrieval";

import { responseNode } from "./nodes/response";
import { routerAfterEscalation } from "./router";
import { escalationNode } from "./nodes/escalation";



const main = async () => {
    let state : SupportState = {
        query:"something weird happened maybe i am not sure damn what is happeing lol",
        currentNode:"start"
    }
    console.log("\nINITIAL STATE");
    console.log(state);

    // CLASSIFICATION NODE IN ACTION 
    state = await classificationNode(state);

    // We will be running nodes decision based :) => Based on confidence computed at classification node
    const nextStep = routerAfterEscalation(state);
    console.log(nextStep)

    if(nextStep==="retrieval"){
        state = await retrievalNode(state);
        state = await responseNode(state);
    }
    else{
        state = await escalationNode(state);
    }
    
    

    console.log("\nFINAL STATE");
    console.log(state)

}

main();
