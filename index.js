if(process.env.NODE_ENV !== "production") {
	require('dotenv').config()
}
const TITO_SHARED_TOKEN = process.env.TITO_SHARED_TOKEN
const redis = require("redis")
let client
if(process.env.NODE_ENV !== "production") {
	client = redis.createClient({
    	host: process.env.REDIS_URL
	})
} else {
	client = redis.createClient(process.env.REDIS_URL)
}

const restify = require('restify');
const crypto = require('crypto');


function respond(req, res, next) {
	res.send('ok');

	const signature = req.headers['tito-signature']
	const hmac = crypto.createHmac('sha256', TITO_SHARED_TOKEN);
	hmac.update(JSON.stringify(req.body));

	console.log(signature);
	console.log(hmac.digest('base64'));


  	const { reference, updated_at } = req.body
  //client.set(reference, updated_at )
  next();
}

const server = restify.createServer();

server.post('/webhook', respond);
server.head('/webhook', respond);
server.use(restify.plugins.bodyParser())

server.listen(process.env.PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
