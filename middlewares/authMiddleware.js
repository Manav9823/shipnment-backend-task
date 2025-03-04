const { User } = require("../models/userModel")
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authMiddleware = async(req, res, next) => {
    console.log('mamanv')
    console.log(req.cookies)
    const accessToken = req.headers['authorization'].split(' ')[1]
    console.log('access',accessToken)
    const refreshToken = req.cookies['refreshToken']
    console.log('refresh', refreshToken)
    if (!accessToken && !refreshToken) {
        return res.status(401).send('Access Denied. No token provided.')
    }
    try{
        console.log('inside verify', process.env.JWT_SIGN_STRATEGY)
        const {id} = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN)
        console.log('manav avava', id)
        const user = await User.findOne({_id: id})
        console.log('user here is',user)
        if(!user){
            throw new Error('User not found')
        }
        console.log('here currently')
        req.user = user
        next()
    } catch(err) {
        if(!refreshToken) {
            return res.status(401).send('Access Denied. No refresh token provided.')
        } 
        try {
            const {id} = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN)
            const user = await User.findOne({_id: id})
            console.log('user', user)
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '1h' })
            console.log('in refresh token')
            console.log(accessToken)
            res
              .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
              .header('Authorization', accessToken)
              .send(decoded.user)
          } catch (error) {
            return res.status(400).send('Invalid Token.')
          }
    }
}

module.exports = authMiddleware