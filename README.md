# tito-hook

Small service that registers Ti.to ticket references via webhooks.

We use this service to check registrations for our workshops, without moving any personal information. We deploy this to Heroku.

## API

#### Check if a registration is existing

```
curl --location --request GET 'http://0.0.0.0:8080/check/AAAA-1'
```

Returns 200 if the registration exists or 404 otherwise.

#### Register a new ticket purchase

```
curl --location --request POST 'http://0.0.0.0:8080/webhook' \
--header 'tito-signature: 6wuxCpmNlLFTQyTc6zdnTIYCPe04YusZ8+y0UQl5cFU=' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
    "state_name": "new",
    "reference": "ABCD-1",
    "updated_at": "now"
}'
````

This is based on how the [ti.to webhooks](https://ti.to/docs/api/admin#webhooks-payloads) work.

## Development

- Clone/fork the repo.
- Rename `.env.example` to `.env` and add your `TITO_SECURITY_TOKEN` _(it's displayed in the tito admin, Customize / Webhooks menu)_
- `npm install`
- Start the dev environment using `npm run dev`

This will spin up a few docker containers:

- node 12
- redis
- redis commander _(useful to debug redis content)_

You can create a test signature for a payload using `scripts/encode-payload.js`


```bash
$ node scripts/encode-payload.js '{"state_name":"new","reference":"ABCD-1","updated_at":"now"}'

Encoding  {"state_name":"new","reference":"ABCD-1","updated_at":"now"}
tito-signature: 6wuxCpmNlLFTQyTc6zdnTIYCPe04YusZ8+y0UQl5cFU=
```

Use this signature in the `tito-signature` headers in your POST request if you want to test locally.


## License

MIT License

Copyright (c) 2018 JSConf Budapest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

