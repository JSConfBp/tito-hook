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
const { promisify } = require('util')
const getAsync = promisify(client.get).bind(client);
const restify = require('restify');
const crypto = require('crypto');

function webhook(req, res, next) {
	res.send('ok');

	const signature = req.headers['tito-signature']
	const hmac = crypto.createHmac('sha256', TITO_SHARED_TOKEN);
	hmac.update(JSON.stringify(req.body));

	if (signature === hmac.digest('base64')) {
		const { reference, updated_at } = req.body
		client.set(reference, updated_at)
		console.log(reference, updated_at);
	}

	// TODO ID removal

  	next();
}

async function reference (req, res, next) {
	const id = req.params.titoid
	const result = await getAsync(id)

	if (result) {
		res.status(200);
	} else {
		res.status(404);
	}

	next()
}

const server = restify.createServer();

server.post('/webhook', webhook);
server.head('/webhook', webhook);

server.get('/reference/:titoid', reference);
server.head('/reference/:titoid', reference);

server.use(restify.plugins.bodyParser())

server.listen(process.env.PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
