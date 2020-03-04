if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { promisify } = require('util')
const restify = require('restify')
const crypto = require('crypto')
const redis = require('redis')

const { TITO_SECURITY_TOKEN } = process.env

let client

if (process.env.NODE_ENV !== 'production') {
  client = redis.createClient({
    host: process.env.REDIS_URL
  })
} else {
  client = redis.createClient(process.env.REDIS_URL)
}

const setAsync = promisify(client.set).bind(client)
const getAsync = promisify(client.get).bind(client)
const delAsync = promisify(client.del).bind(client)

async function webhook (req, res, next) {
  res.send('ok')

  const signature = req.headers['tito-signature']

  const hmacJS = crypto.createHmac('sha256', TITO_SECURITY_TOKEN)
  hmacJS.update(JSON.stringify(req.body))

  const pass = (signature === hmacJS.digest('base64'))

  if (pass) {
    const { state_name: stateName, reference, updated_at: updatedAt = '' } = req.body

    if (stateName === 'new') {
      await setAsync(reference, updatedAt)
      console.log('set', reference, updatedAt)
    }

    if (stateName === 'void') {
      await delAsync(reference)
      console.log('removed', reference)
    }
  }

  next()
}

async function check (req, res, next) {
  const id = req.params.titoid

  const result = await getAsync(id)

  if (result) {
    res.status(200)
    res.send('200')
  } else {
    res.status(404)
    res.send('404')
  }

  next()
}

const server = restify.createServer()

server.post('/webhook', webhook)
server.head('/webhook', webhook)

server.get('/check/:titoid', check)
server.head('/check/:titoid', check)

server.use(restify.plugins.bodyParser())

server.listen(process.env.PORT, function () {
  console.log('%s listening at %s', server.name, server.url)
})
