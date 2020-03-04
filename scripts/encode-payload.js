require('dotenv').config()

const crypto = require('crypto')
const { TITO_SECURITY_TOKEN } = process.env

const hmacJS = crypto.createHmac('sha256', TITO_SECURITY_TOKEN)

console.log('Encoding ', process.argv[2])

hmacJS.update(process.argv[2])

console.log('tito-signature:', hmacJS.digest('base64'))
