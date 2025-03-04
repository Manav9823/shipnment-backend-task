const mongoose = require('mongoose')
const { v4: uuidv4 } = require("uuid")
const orderItemSchema = {
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        required: true
    }
}

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type:String,
        default: uuidv4
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {type:String, enum: ["Pending", "Processed", "Failed"], default: "Pending"}
}, {timestamps:true})

const Order = mongoose.model('Order', OrderSchema)
module.exports = Order