import { ToolDefination } from "../types.js";

export const getOrderDetailsTool: ToolDefination = {
  name: "getOrderDetails",
  desciption: "Returns the details of the order based on Order Id",
  humanApprovalReqd: false,
  async execute(toolInput: any) {
    const { orderId } = toolInput;
    const fakeDB: Record<string, any> = {
      ORD123: {
        items: "shoes",
        quantity: 1,
        price: 1000,
      },
      ORD456: {
        items: "mobile",
        quantity: 3,
        price: 10000,
      },
      ORD789: {
        items: "iphone",
        quantity: 1,
        price: 79999,
      },
    };
    return fakeDB[orderId] || { items: "Not found", quantity: 0, price: 0 };
  },
};
