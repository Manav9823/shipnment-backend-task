const validator = require('validator')

const validateSignupField = (req, res) => {
    const {userName, email, password} = req.body
    if(!userName || !email || !password) {
        throw new Error('Fields are missing from the request body')
    } else if(!validator.isEmail(email)){
        throw new Error('Email has a issue in it')
    } else if(!validator.isStrongPassword(password)) {
        throw new Error('Password is not Strong enough')
    }
}

const validateLoginField = (req, res) => {
    const {email, password} = req.body

    if(!email || !password) {
        throw new Error('Credentials not present')
    } else if(!validator.isEmail(email)) {
        throw new Error('Invalid Credentials')
    } else if(!validator.isStrongPassword(password)) {
        throw new Error("Invalid credentials")
    }
}

const validatorOrder = (req, res) => {
    const {items} = req.body
    if(!items) {
        throw new Error('Items not present in the request body')
    } else if(!Array.isArray(items)) {
        throw new Error('Items should be in the array format')
    } else if(items.length === 0) {
        throw new Error('Items array is empty there is nothing to be placed')
    }
}


module.exports = {validateSignupField, validateLoginField, validatorOrder}