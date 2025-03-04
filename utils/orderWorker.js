const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs")
const Order = require("../models/orderModel")
const { User } = require("../models/userModel")
const sendOrderEmail = require("./awsSES")
require("dotenv").config()

// Create AWS SQS client
const sqsClient = new SQSClient({ region: process.env.AWS_REGION })
const queueUrl = process.env.AWS_SQS_URL

async function processOrder(orderId) {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      console.error("Order not found:", orderId)
      return
    }

    // Simulate payment processing (80% success rate)
    const paymentSuccessful = Math.random() > 0.2

    order.status = paymentSuccessful ? "Processed" : "Failed"
    await order.save()
    console.log(`✅ Order ${orderId} processed: ${order.status}`)
    const user = await User.findById(order.userId)
    if(!user) {
      throw new Error('User not found by user id')
    } 
    console.log(user)
    if(user.email) {
      await sendOrderEmail(user.email, order)
    }
  } catch (error) {
    console.error("❌ Error processing order:", error)
  }
}

// Function to poll SQS continuously
async function pollSQS() {
  try {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10, // Long polling
    }

    const command = new ReceiveMessageCommand(params)
    const data = await sqsClient.send(command)

    if (data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        const { orderId } = JSON.parse(message.Body)
        console.log("🔄 Processing order:", orderId)

        await processOrder(orderId)

        // Delete message from queue after processing
        const deleteParams = {
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }

        await sqsClient.send(new DeleteMessageCommand(deleteParams))
        console.log("🗑️ Message deleted from queue")
      }
    } else {
      console.log("📭 No messages in queue")
    }
  } catch (error) {
    console.error("❌ Error polling SQS:", error)
  }

  // **Ensure polling continues even if no messages are found**
  setImmediate(pollSQS)  // Runs the function again immediately
}

// Start polling when script runs
pollSQS()

module.exports = pollSQS
