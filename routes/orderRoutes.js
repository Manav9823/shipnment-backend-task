const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { validatorOrder } = require('../utils/utils')
const Product = require('../models/productModel')
const orderRouter = express.Router()
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs")
const Order = require('../models/orderModel')
const { default: mongoose } = require('mongoose')
require("dotenv").config()
const Redis = require('ioredis')

const sqsClient = new SQSClient({ region: process.env.AWS_REGION })
const queueUrl = process.env.AWS_SQS_URL

const redis = new Redis({
  host: process.env.REDIS_HOST, // Example: "127.0.0.1" if running locally
  port: process.env.REDIS_PORT, // Example: 6379
  password: process.env.REDIS_PASSWORD, // If Redis is password-protected
})


orderRouter.post('/orders', authMiddleware, async(req, res) => {
    try {
        const {items} = req.body
        const user = req.user
        validatorOrder(req, res)
        let totalAmount = 0
        let updatedProducts = []
        for (const item of items) {
            const product = await Product.findById(item.product)
            console.log('prodcut', product)
            if (!product) {
              return res.status(404).json({ message: `Product not found: ${item.product}` })
            }
      
            if (product.quantity < item.quantity) {
              return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
            }
            console.log('totalAmount')

            totalAmount += Number(product.price) * item.quantity
            updatedProducts.push({
              productId: product._id,
              newQuantity: product.quantity - item.quantity,
            })
            console.log('updated Products', updatedProducts)
        }

        for (const p of updatedProducts) {
            console.log('p', p)
            await Product.findByIdAndUpdate(p.productId, { quantity: p.newQuantity })
        }
        console.log('new product')

        // Create order
        console.log('items', items)
        console.log('total', totalAmount)
        const newOrder = new Order({
            userId: user._id,
            items: items.map(item => ({
              product: new mongoose.Types.ObjectId(item.product), // Explicitly convert
              quantity: item.quantity
            })),
            totalAmount: totalAmount,
            status: "Pending",
        })
         console.log('new order', newOrder)
         await newOrder.save()

         const messageBody = JSON.stringify({ orderId: newOrder._id })

         const command = new SendMessageCommand({
           QueueUrl: queueUrl,
           MessageBody: messageBody,
         })
     
         const data = await sqsClient.send(command)
         console.log("Order pushed to SQS:", data.MessageId)

         res.status(201).json({ message: "Order placed successfully!", order: newOrder })
    } catch(err) {
        res.status(400).json({message: 'There is a issue processing the order. Please try after sometime'})
    }
})

orderRouter.post('/getOrder', authMiddleware, async(req, res) => {
  try {
    const {id} = req.body
    const cacheKey = `order:${id}` 
    const cachedOrder = await redis.get(cacheKey)
    if(cachedOrder) {
      console.log(`Cache hit for order: ${id}`)
      return res.status(200).json({message: cachedOrder})
    }
    console.log(`🔍 Cache miss for order: ${id}, fetching from DB...`)
    const order = await Order.findById(id)
    if(!order) {
      throw new Error('Order not found by order id')
    }
    await redis.set(cacheKey, JSON.stringify(order), "EX", 600)
    return res.status(200).json({message: order})
  } catch(err) {
    console.log(err)
    res.status(400).json({message: `${err.message}`})
  }
})

module.exports = orderRouter