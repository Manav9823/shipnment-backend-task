const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
        default: 100
    },
    quantity: {
        type: String,
        required:true,
        default: 10
    }
}, {timestamps: true})

const Product = mongoose.model('Product', ProductSchema)
module.exports = Product