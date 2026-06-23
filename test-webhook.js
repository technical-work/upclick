const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/telegram/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  res.on('data', d => process.stdout.write(d));
});

req.write(JSON.stringify({
  message: {
    message_id: 1,
    text: 'hi',
    date: 123,
    chat: { id: 123 },
    from: { id: 123, first_name: 'Ahmed' }
  }
}));

req.end();
