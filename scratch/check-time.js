const http = require('https');

http.get('https://www.google.com', (res) => {
  console.log('Google Server Date:', res.headers.date);
  console.log('Local System Date :', new Date().toUTCString());
  process.exit(0);
}).on('error', (err) => {
  console.error('Error fetching time:', err);
  process.exit(1);
});
