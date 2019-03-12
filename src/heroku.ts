import * as http from 'http';
import ms from 'ms';
import * as rp from 'request-promise';

const server = http.createServer((req, res) => res.end('OK'));
server.listen(process.env.PORT || 3000);

// Anti server sleep
(async function wakeUp() {
  await rp.get(process.env.HEROKU_APP_URL, err => {
    if (err) throw err;
    console.log('Woke up!');
    setTimeout(wakeUp, ms('15m')); // 15m
  });
})();
