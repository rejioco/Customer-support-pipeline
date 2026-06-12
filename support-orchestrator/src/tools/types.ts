
export interface ToolDefination {
    name:string;
    desciption:string;
    humanApprovalReqd:boolean;
    execute(input:any): Promise<any>
}



// --- Example ---
// {
//     name:"initiateRefund",
//     desciption:"This tool initiates a refund for the orders requested for",
//     humanApprovalReqd:true,
//     execute()
// }

// {
//     name:"getOrderStatus",
//     desciption:"This tool gets the current status of the order",
//     humanApprovalReqd:false,
//     execute()
// }