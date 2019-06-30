import * as rp from 'request-promise';

import ms from 'ms';

// Anti server sleep
(async function wakeUp() {
  await rp.get(process.env.HEROKU_APP_URL, err => {
    if (err) throw err;
    console.log('Woke up!');
    setTimeout(wakeUp, ms('15m')); // 15m
  });
})();