const express = require('express')
const bodyParser = require('body-parser')
const connectDB = require('./database/db')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authRoutes')
const pollSQS = require('./utils/orderWorker')
const orderRouter = require('./routes/orderRoutes')
require('dotenv').config()
const PORT = process.env.PORT || 5000


const app = express()
app.use(bodyParser.json())
app.use(cookieParser())
app.use('/', authRouter)
app.use('/', orderRouter)


connectDB()
.then(() => {
    console.log(`DB connected Successfully`)
    pollSQS()
    app.listen(PORT, () => {
        console.log(`Server is listening at the port : ${PORT}`)
    })
}).catch((err) => {
    console.log(`Error connecting to the server ${err}`)
})