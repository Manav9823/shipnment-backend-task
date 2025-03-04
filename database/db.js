const mongoose = require('mongoose')

const connectDB = async() => {
    await mongoose.connect(`mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@shipnment-cluster.o6syj.mongodb.net/shipnment`)
}

module.exports = connectDB