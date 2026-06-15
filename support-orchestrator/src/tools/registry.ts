import { getCustomerDetailsTool } from "./customer/getCustomerDetails.js"
import { getOrderDetailsTool } from "./orders/getOrderDetails.js"
import { getOrderStatusTool } from "./orders/getOrderStatus.js"
import {initiateRefundTool} from "./refunds/initiateRefund.js"

// import all the tools and create a registry

export const toolRegistry = {
    getCustomerDetails: getCustomerDetailsTool,
    getOrderDetails: getOrderDetailsTool,
    getOrderStatus: getOrderStatusTool,
    initiateRefund: initiateRefundTool,
    issueRefund: initiateRefundTool,
} as const;
