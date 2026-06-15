import { ToolDefination } from "../types.js";


export const initiateRefundTool : ToolDefination = {
    name: "initiateRefund",
    desciption:"This tool initiates refund based on user query for refund",
    humanApprovalReqd:true,
    async execute(input) {
        const {orderId} = input;
        // Refund logic
        return `Your refund has been initiated for the orderId ${orderId}`
        
    },
}
