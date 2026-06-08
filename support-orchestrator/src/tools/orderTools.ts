export const getOrderStatus = async (toolInput:any) => {
    const {orderId} = toolInput;
    const fakeDB : Record<string,any> = {
        "ORD123":{
            status:"Out for delivery",
            eta:"Tomorrow"
        },
        "ORD456":{
            status:"Delivered",
            eta:"Delivered Yeasterday"
        },
        "ORD789":{
            status:"Order packed",
            eta:"5 days"
        }
    }

    return fakeDB[orderId] || {
        status:"Not found",
        eta:null
    }
}

export const issueRefund = async (toolInput:any) => {
    const {orderId,reason} = toolInput;
    return `Refund process initiated for ${orderId} with the reason ${reason} Thank u 🙏🏻`
}


export const updateAddress = async (toolInput:any) => {
    const {orderId,street,city,zip} = toolInput;
    return `Address updated successfully for ${orderId} to ${street}, ${city}, ${zip}`
}


export const getOrderDetails = async (toolInput:any) => {
    const {orderId} = toolInput;
    const fakeDB : Record<string,any> = {
        "ORD123":{
            items:"shoes",
            quantity:1,
            price:1000
        },
        "ORD456":{
            items:"mobile",
            quantity:3,
            price:10000
        },
        "ORD789":{
            items:"iphone",
            quantity:1,
            price:79999
        }
    }
    return fakeDB[orderId] || { items: "Not found", quantity: 0, price: 0 };
}

export const getCustomerDetails = async (toolInput:any) => {
    const {customerId} = toolInput;
    const fakeDB : Record<string,any> = {
        "CUST123": {
            name: "Ayush Guleria",
            email: "ayush@gmail.com",
            phone: "7034294207",
            address: {
                street: "Rboys Hostel",
                city: "Mumbai",
                zip: "400005"
            },
            orderId: "ORD456"
        },
        "CUST456": {
            name: "Anu",
            email: "anu@gmail.com",
            phone: "1234567890",
            address: {
                street: "Qtr R39/3E",
                city: "Kangra",
                zip: "700007"
            },
            orderId: "ORD789"
        }
    }

    return fakeDB[customerId] || {
        name : null,
        email: null,
        phone: null,
        address: null
    }
}
