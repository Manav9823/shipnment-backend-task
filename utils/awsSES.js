const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses")
require("dotenv").config()

// Configure AWS SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_SES,
    secretAccessKey: process.env.AMAZON_SECERT_ACCESS_KEY_SES,
  },
})

async function sendOrderEmail(userEmail, order) {
  const params = {
    Source: process.env.AWS_SES_SENDER_EMAIL, // Must be a verified email in AWS SES
    Destination: {
      ToAddresses: [userEmail], // Recipient email
    },
    Message: {
      Subject: {
        Data: `Order Confirmation - Order #${order._id}`,
      },
      Body: {
        Html: {
          Data: `
            <h2>Thank you for your order!</h2>
            <p>Your order has been <strong>${order.status}</strong>.</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
            <h3>Items Purchased:</h3>
            <ul>
              ${order.items.map(
                (item) => `<li>${item.quantity} x ${item.product}</li>`
              ).join("")}
            </ul>
            <p>We appreciate your business!</p>
          `,
        },
      },
    },
  }

  try {
    await sesClient.send(new SendEmailCommand(params))
    console.log(`📧 Email sent to ${userEmail}`)
  } catch (error) {
    console.error("❌ Error sending email:", error)
  }
}

module.exports = sendOrderEmail
