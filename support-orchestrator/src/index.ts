import { SupportState } from "./state";

import { classificationNode } from "./nodes/classifier";

import { retrievalNode } from "./nodes/retrieval";

import { responseNode } from "./nodes/response";

const main = async () => {
    let state : SupportState = {
        query:"My app is not loading order section when i try to open it",
        currentNode:"start"
    }
    console.log("\nINITIAL STATE");
    console.log(state);

    state = await classificationNode(state);
    state = await retrievalNode(state);
    state = await responseNode(state);

    console.log("\nFINAL STATE");
    console.log(state)

}

main();
