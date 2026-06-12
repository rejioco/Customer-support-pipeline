import { ToolDefination } from "../types.js";

export const getOrderStatusTool: ToolDefination = {
  name: "getOrderstatus",
  desciption: "This tool gets me the status of the order",
  humanApprovalReqd: false,
  async execute(input: any) {
    const { orderId } = input;

    const fakeDB: Record<string, any> = {
      ORD123: {
        status: "Out for delivery",
        eta: "Tomorrow",
      },
      ORD456: {
        status: "Delivered",
        eta: "Delivered yesterday",
      },
      ORD789: {
        status: "Order packed",
        eta: "5 days",
      },
    };

    return (
      fakeDB[orderId] || {
        status: "Not found",
        eta: null,
      }
    );
  },
};
