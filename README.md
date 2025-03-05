# npm i 
# npm run dev ----> nodemon index.js
# Start the redis on your local first
redis-server

# Packages used: 
 ## express
 ## jsonwebtoken
 ## dotenv
 ## bcrypt
 ## mongoose
 ## uuid
 ## validator
 ## redis
 ## body-parser
 ## nodemon
 ## @aws-sdk/client-ses
 ## @aws-sdk/client-sqs

# auth check features
User signups to the account with username,email, password

### API: /signup
### Request body: 
{
    "userName": "",
    "password": "",
    "email": ""
}

User logins with the email and password, access token, refresh token created, stored in header authorization and res.cookie

## API: /login
## Request body:
{
    "email": "",
    "password": ""
}

# Order placement features:

Create order, after the validation checks order is placed with a pending state and that order is pushed to the AWS SQS, and there after the payment validation
status is changed from PENDING to PROCESSED along with a email is sent to the user verified email through AWS SES

## API: /order
## Request body 
{
   "items": [
    {"product":"67c6b42b6e582dd6135b167d", "quantity": 1}
   ]
}

# fetch order

Order is fetched for the user and while fetching the order is stored in the redis cache IOREDIS so that 2 time the user fetches the order it is fetched from the redis cache(there is a
timestamp for each order in the cache)

## API: /getOrder
## Request body: 
{
   "id": "67c6ca5826b8ce82956115ce"
}


### NOTE: currently the order email is sent only to the verified user on the aws so if you are not getting email thats the issue attaching a SS to tell that he are able to successfully send the email