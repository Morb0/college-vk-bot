import * as dotenv from 'dotenv';
import { VK } from 'vk-io';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { getRandomInt } from './utils';
const facts = require('../data/facts.json');

dotenv.config();

const ENDPOINT = 'http://simfpolyteh.ru';

const vk = new VK();

// Setup token
vk.setOptions({
  token: process.env.VK_TOKEN,
  pollingGroupId: process.env.GROUP_ID,
});

// Skip outbox message and handle errors
vk.updates.use(
  async (context: any, next: (...args: any[]) => any): Promise<void> => {
    if (context.is('message') && context.isOutbox) {
      return;
    }

    try {
      await next();
    } catch (error) {
      console.error('Error:', error);
    }
  },
);

// Handle message payload
vk.updates.use(
  async (context: any, next: (...args: any[]) => any): Promise<void> => {
    if (context.is('message')) {
      const { messagePayload } = context;

      context.state.command =
        messagePayload && messagePayload.command
          ? messagePayload.command
          : null;
    }

    await next();
  },
);

const hearCommand = (
  name: string,
  conditions: string[],
  handle: (context: any) => any,
): void => {
  console.log(`Bot register commands: ${conditions.join(', ')}`);

  vk.updates.hear(
    [
      (text, context) => {
        if (context.state.command === name) {
          return true;
        }

        if (/[club\d+\|?.+\] \/[a-zA-Z0-9А-Яа-я]+/.test(text)) {
          // Check command format
          for (const command of conditions) {
            if (text.startsWith(command)) {
              return true;
            }
          }
        }

        return false;
      },
      ...conditions,
    ],
    handle,
  );
};

hearCommand('alive', ['/alive'], (context: any) => {
  context.sendSticker(9046);
});

hearCommand(
  'timetable',
  ['/tt', '/timetable', '/raspisanie', '/rasp', '/расписание', '/расп'],
  async (context: any) => {
    // Get image url
    const $ = await rp.get(`${ENDPOINT}/raspisanie`, {
      transform: (body: string) => cheerio.load(body),
    });

    const imageUrl = $('.page_raspis_block_img')
      .find('img')
      .first()
      .attr('src');

    // Get image
    const imgBuffer = await rp.get(imageUrl, {
      encoding: null,
    });

    // Load to sharp
    const sharpImg = sharp(imgBuffer);

    // Check image size
    const imgInfo = await sharpImg.metadata();

    // Modify image
    const modifiedImgBuffer = await sharpImg
      .extract({
        left: 0,
        top: imgInfo.height - 177, // calculated image size
        width: 129,
        height: 177,
      }) // Extract table
      .resize(258, 354) // Resize x2
      .toBuffer();

    const attachmentPhoto = await vk.upload.messagePhoto({
      source: modifiedImgBuffer,
    });

    context.send({
      attachment: attachmentPhoto,
    });
  },
);

hearCommand('callSchedule1', ['/cs1', '/call1'], async (context: any) => {
  const imageUrlTuesday = `${ENDPOINT}/wp-content/themes/politeh/image/Korpus_1_2.png`;
  const imageUrlOther = `${ENDPOINT}/wp-content/themes/politeh/image/Korpus_1_1.png`;
  const currentDay = new Date().getDay();

  // Get image
  const imgBuffer = await rp.get(
    currentDay === 2 ? imageUrlTuesday : imageUrlOther,
    {
      encoding: null,
    },
  );

  // Attach photo
  const attachmentPhoto = await vk.upload.messagePhoto({
    source: imgBuffer,
  });

  // Send message
  context.send({
    attachment: attachmentPhoto,
  });
});

hearCommand('callSchedule2', ['/cs2', '/call2'], async (context: any) => {
  const imageUrlTuesday = `${ENDPOINT}/wp-content/themes/politeh/image/Korpus_2_2.png`;
  const imageUrlOther = `${ENDPOINT}/wp-content/themes/politeh/image/Korpus_2_1.png`;
  const currentDay = new Date().getDay();

  // Get image
  const imgBuffer = await rp.get(
    currentDay === 2 ? imageUrlTuesday : imageUrlOther,
    {
      encoding: null,
    },
  );

  // Attach photo
  const attachmentPhoto = await vk.upload.messagePhoto({
    source: imgBuffer,
  });

  // Send message
  context.send({
    attachment: attachmentPhoto,
  });
});

hearCommand('hook', ['/hook', '/h'], async (context: any) => {
  const members = await vk.api.messages.getConversationMembers({
    peer_id: context.peerId,
  });

  // Get random profile
  const randomProfile =
    members.profiles[getRandomInt(0, members.profiles.length)];

  context.send(
    `Get over here - ${randomProfile.first_name} ${randomProfile.last_name}`,
  );
});

hearCommand('milos', ['/ricardo', '/milos'], async (context: any) => {
  const imagesUrl = [
    'https://pp.userapi.com/c846417/v846417081/13778f/5h8TWF_P97M.jpg',
    'https://s11.stc.all.kpcdn.net/share/i/12/10740975/inx960x640.jpg',
    'https://m.tagilcity.ru/attachments/6f265b248234614ca65589f206270885cb53eba1/store/crop_and_fill/0/35/1044/587/450/253/ead0936b690dca636729c1d6b7d2911d9f42f8de6252b188c5ad21334106/2019-01-01_17-18.jpg',
    'http://c.sibdepo.ru/wp-content/uploads/2019/01/1546175542_1753397232.jpg',
    'http://pm1.narvii.com/7029/44feb0e1a2c15bbd9503bf1c4998805e76921258r1-1280-720v2_00.jpg',
    'https://nefteproduct.su/uploads/posts/2019-01/1546367109153de85a01daaa834ee9c2c1725e3f5dd7d8aea61-768x480.png',
  ];

  // Get image
  const imgBuffer = await rp.get(imagesUrl[getRandomInt(0, imagesUrl.length)], {
    encoding: null,
  });

  // Attach photo
  const attachmentPhoto = await vk.upload.messagePhoto({
    source: imgBuffer,
  });

  // Send message
  context.send({
    attachment: attachmentPhoto,
  });
});

hearCommand('fact', ['/fact', '/f'], async (context: any) => {
  const randomFact = facts[getRandomInt(0, facts.length)];

  // Send message
  context.send(randomFact);
});

async function run() {
  if (process.env.UPDATES === 'webhook') {
    await vk.updates.startWebhook();

    console.log('Webhook server started');
  } else {
    await vk.updates.startPolling();

    console.log('Polling started');
  }
}

run().catch(console.error);

// Web server
import * as http from 'http';
const server = http.createServer((req, res) => res.end('Bot work'));
server.listen(process.env.PORT || 3000);

// Anti server sleep
(async function wakeUp() {
  await rp.get(process.env.HEROKU_APP_URL, err => {
    if (err) throw err;
    console.log('Woke up!');
    setTimeout(wakeUp, 15 * (60 * 1000)); // 15m
  });
})();
