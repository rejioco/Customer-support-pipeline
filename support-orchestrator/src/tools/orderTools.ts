export const getOrderStatus = async (id:string) => {
    const fakeDB : Record<string,any> = {
        "ORD123":{
            status:"Out for delivery",
            eta:"Tomorrow"
        },
        "ORD456":{
            status:"Delivered",
            eta:"Delivered Yeasterday"
        }
    }

    return fakeDB[id] || {
        status:"Not found",
        eta:null
    }
}

export const getRefundStatus = (id:string) => {
    return "Refund mil jayega bsdk"
}



