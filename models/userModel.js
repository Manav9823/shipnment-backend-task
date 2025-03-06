const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    email: {
        type: String,
        required:true,
        unique: true,
        trim:true
    },
    password: {
        type: String,
        required: true
    },
    refreshtoken: {
        type: String
    }
}, {timestamps: true})

UserSchema.methods.getAccessJWT = async function() {
    const user = this
    const accessToken = await jwt.sign({id:user._id}, process.env.JWT_SIGN_STRATEGY, {expiresIn: '60m'})
    return accessToken
}

UserSchema.methods.getRefreshJWT = async function() {
    const user = this
    const refreshToken = jwt.sign({id:user._id}, process.env.JWT_REFRESH_TOKEN, {expiresIn: '7d'})
    return refreshToken
}

const User = mongoose.model("User", UserSchema)
module.exports = {User}