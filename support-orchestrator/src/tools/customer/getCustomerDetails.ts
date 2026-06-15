import { ToolDefination } from "../types.js";

export const getCustomerDetailsTool: ToolDefination = {
  name: "getCustomerDetails",
  desciption: "Gets me the details about the customer based on customerId",
  humanApprovalReqd:false,
  async execute(input) {
    // Logic to get Details of the customer
    const fakeDB: Record<string, any> = {
      CUST123: {
        name: "Ayush Guleria",
        email: "ayush@gmail.com",
        phone: "7034294207",
        address: {
          street: "Rboys Hostel",
          city: "Mumbai",
          zip: "400005",
        },
        orderId: "ORD456",
      },
      CUST456: {
        name: "Anu",
        email: "anu@gmail.com",
        phone: "1234567890",
        address: {
          street: "Qtr R39/3E",
          city: "Kangra",
          zip: "700007",
        },
        orderId: "ORD789",
      },
    };
    return (
      fakeDB[input.customerId] || {
        name: "Not Found",
        email: null,
        phone: null,
        address: null,
        orderId: null,
      }
    );
  },
};
