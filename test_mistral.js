const https = require('https');
const data = JSON.stringify({
  model: 'mistral-large-latest',
  messages: [{role: 'user', content: 'hi'}]
});
const req = https.request('https://api.mistral.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer Uhk3m4xQ1m3MeyJD8G2hUXV9CUPia9AE',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', d => body+=d);
  res.on('end', () => console.log(res.statusCode, body));
});
req.write(data);
req.end();
