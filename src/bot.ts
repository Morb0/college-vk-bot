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

hearCommand('hello', [], (context: any) => {
  context.sendSticker(9015);
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

hearCommand('hook', [], async (context: any) => {
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

hearCommand('milos', ['/ricardo'], async (context: any) => {
  const imagesUrl = [
    'https://pp.userapi.com/c846417/v846417081/13778f/5h8TWF_P97M.jpg',
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

hearCommand('fact', ['/f'], async (context: any) => {
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
