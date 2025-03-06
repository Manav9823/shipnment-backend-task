const express = require('express')
const { validateSignupField, validateLoginField } = require('../utils/utils')
const authRouter = express.Router()
const bcrypt = require('bcrypt')
const { User } = require('../models/userModel')
const authMiddleware = require('../middlewares/authMiddleware')
authRouter.post('/signup', async(req, res) => {
    try{
        validateSignupField(req, res)
        const {userName, password, email} = req.body
        const bcryptPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            username: userName,
            password: bcryptPassword,
            email: email
        })
        await newUser.save()
        return res.status(200).json({message: "User added sucessfully in the database"})
    } catch (err) {
        console.log(err)
        return res.status(400).json({message:`Issue registering the user:  ${err.message}`})
    }
})

authRouter.post('/login', async(req, res) => {
    try {
        validateLoginField(req, res)
        const {email, password} = req.body
        const user = await User.findOne({email: email})
        if(!user) {
            throw new Error('User not found with the given email')
        }
        const valid = await bcrypt.compare(password, user.password)
        if(valid) {
            const authToken = await user.getAccessJWT()
            const refreshToken = await user.getRefreshJWT()
            console.log('manav access token ',authToken)
            console.log(refreshToken)
            user.refreshtoken = refreshToken
            await user.save()
            res.header('Authorization', `Bearer ${authToken}`)
            res.cookie('refreshToken', refreshToken, {httpOnly: true, sameSite: "strict"})
            return res.status(200).json({message: "User logged in successfully"})
        } else {
            throw new Error('Error logging in user')
        }
    } catch(err) {
        return res.status(400).json({message: `${err.message}`})
    }
})

authRouter.post('/refresh', async(req, res) => {
    console.log('in refresh', req.cookies)
    const refreshToken = req.cookies['refreshToken']
    if (!refreshToken) {
      return res.status(401).send('Access Denied. No refresh token provided.')
    }
    try {
    console.log(process.env.JWT_REFRESH_TOKEN)
      const {id} = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN)
      const user = await User.findOne({_id: id})
      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SIGN_STRATEGY, { expiresIn: '1h' })
      res.header('Authorization', `Bearer ${accessToken}`)
      res.status(200).json({message: 'Added new access token'})
    } catch (error) {
      return res.status(400).send('Invalid refresh token.')
    }
})

module.exports = authRouter

