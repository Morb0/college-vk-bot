import * as dotenv from 'dotenv';
import { VK, MessageContext, Context, AudioAttachment } from 'vk-io';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { merge } from 'image-glue';
import ms from 'ms';
import * as fs from 'fs';
import { getRandomInt } from './utils';
const facts = require('../data/facts.json');
const peerIds = require('../peerIds.json');

dotenv.config();

const ENDPOINT = 'http://simfpolyteh.ru';

const vk = new VK();

// Setup token
vk.setOptions({
  token: process.env.VK_TOKEN,
  pollingGroupId: +process.env.GROUP_ID,
});

// Skip outbox message and handle errors
vk.updates.use(
  async (
    context: Context | MessageContext,
    next: (...args: any[]) => any,
  ): Promise<void> => {
    if (context.is(['message']) && context.isOutbox) {
      return;
    }

    try {
      await next();
    } catch (error) {
      console.error('Error:', error);
    }
  },
);

// Handle dialogs when bot used
vk.updates.use(
  async (
    context: Context | MessageContext,
    next: (...args: any[]) => any,
  ): Promise<void> => {
    if (context.is(['message'])) {
      const { peerId } = context;
      if (peerIds.indexOf(peerId) === -1) {
        peerIds.push(peerId);
        fs.writeFileSync('./peerIds.json', JSON.stringify(peerIds));
      }
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
      (text: string) => {
        if (/[club\d+\|?.+\] \/[a-zA-Z0-9А-Яа-я]+/.test(text)) {
          // Check command format
          for (const command of conditions) {
            if (text && text === command) {
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
  try {
    context.sendSticker(9046);
  } catch (err) {
    context.send(
      '❌ An unknown error occurred while trying to execute a command',
    );
  }
});

hearCommand('help', ['/help'], (context: any) => {
  try {
    context.send(`
      📋 List of available commands:
      ➡ /help - Show available commands
      ➡ /alive - Check bot status
      ➡ /tt - Give available time table
      ➡ /cs1 - Give call schedule for first block
      ➡ /cs2 - Give call schedule for second block
      ➡ /fact - Give random fact from list
      ➡ /hook - Hook random chat user (Admin permissions only)
      ➡ /vika - Command for fun
    `);
  } catch (err) {
    context.send(
      '❌ An unknown error occurred while trying to execute a command',
    );
  }
});

hearCommand(
  'timetable',
  ['/tt', '/timetable', '/raspisanie', '/rasp', '/расписание', '/расп'],
  async (context: any) => {
    try {
      // Get image url
      const $ = await rp.get(`${ENDPOINT}/raspisanie`, {
        transform: (body: string) => cheerio.load(body),
      });

      const imageUrl = $('.page_raspis_block_img')
        .find('img')
        .first()
        .attr('src');

      // Get image
      const imgBuffer = await getRawImage(imageUrl);

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
    } catch (err) {
      context.send(
        '❌ An unknown error occurred while trying to execute a command',
      );
    }
  },
);

hearCommand('callSchedule1', ['/cs1', '/call1'], async (context: any) => {
  try {
    // Get image
    const [imgBufferTuesday, imgBufferOther] = await Promise.all([
      getRawImage(`${ENDPOINT}/wp-content/themes/politeh/image/Korpus_1_2.png`),
      getRawImage(`${ENDPOINT}/wp-content/themes/politeh/image/Korpus_1_1.png`),
    ]);

    // Combine images
    const combinedImg = await merge([imgBufferOther, imgBufferTuesday]);

    // Attach photo
    const attachmentPhoto = await vk.upload.messagePhoto({
      source: combinedImg,
    });

    // Send message
    context.send({
      attachment: attachmentPhoto,
    });
  } catch (err) {
    context.send(
      '❌ An unknown error occurred while trying to execute a command',
    );
  }
});

hearCommand('callSchedule1', ['/cs2', '/call2'], async (context: any) => {
  try {
    // Get image
    const [imgBufferTuesday, imgBufferOther] = await Promise.all([
      getRawImage(`${ENDPOINT}/wp-content/themes/politeh/image/Korpus_2_2.png`),
      getRawImage(`${ENDPOINT}/wp-content/themes/politeh/image/Korpus_2_1.png`),
    ]);

    // Combine images
    const combinedImg = await merge([imgBufferOther, imgBufferTuesday]);

    // Attach photo
    const attachmentPhoto = await vk.upload.messagePhoto({
      source: combinedImg,
    });

    // Send message
    context.send({
      attachment: attachmentPhoto,
    });
  } catch (err) {
    context.send(
      '❌ An unknown error occurred while trying to execute a command',
    );
  }
});

hearCommand('hook', ['/hook', '/h'], async (context: MessageContext) => {
  try {
    const members = await vk.api.messages.getConversationMembers({
      peer_id: context.peerId,
    });

    // Get random profile
    const randomProfile =
      members.profiles[getRandomInt(0, members.profiles.length)];

    context.send(
      `🎣 Get over here - ${randomProfile.first_name} ${
        randomProfile.last_name
      }`,
    );
  } catch (err) {
    if (err.code === 917) {
      context.send('❌ To use this command, bot requires admin rights');
    } else {
      context.send(
        '❌ An unknown error occurred while trying to execute a command',
      );
    }
  }
});

let vikaTimeout;
hearCommand('vika', ['/vika', '/roflan'], async (context: MessageContext) => {
  try {
    const emotesIds = [
      1001738,
      150380,
      958403,
      90896,
      117708,
      1678208,
      41135,
      118081,
      975930,
      1844320,
      1722639,
      59918,
      1388990,
      1381423,
      771070,
      1201063,
      669957,
      181421,
      43996,
      117092,
      117709,
      332579,
      1191320,
      1228008,
    ];

    if (Date.now() < vikaTimeout) {
      context.send(
        `⌛ Arthas takes out the f**king trash (${ms(
          vikaTimeout - Date.now(),
        )})`,
      );
      return;
    }
    vikaTimeout = Date.now() + ms('2h');

    // Get image
    const imgBuffer = await getRawImage(
      `https://static-cdn.jtvnw.net/emoticons/v1/${
        emotesIds[getRandomInt(0, emotesIds.length)]
      }/3.0`,
    );

    // Attach photo
    const attachmentPhoto = await vk.upload.messagePhoto({
      source: imgBuffer,
    });

    // Attach audio
    const attachmentAudio = new AudioAttachment(
      {
        id: 456239689,
        owner_id: 2000421094,
      },
      vk,
    );

    // Send message
    context.send({
      attachment: [attachmentAudio.toString(), attachmentPhoto.toString()],
    });
  } catch (err) {
    context.send(
      '❌ An unknown error occurred while trying to execute a command',
    );
  }
});

hearCommand('fact', ['/fact', '/f'], async (context: MessageContext) => {
  try {
    const randomFact = facts[getRandomInt(0, facts.length)];

    // Send message
    context.send(randomFact);
  } catch (err) {
    context.send(
      '❌ An unknown error occurred while trying to execute a command',
    );
  }
});

function getRawImage(url) {
  return rp.get(url, {
    encoding: null,
  });
}

async function run() {
  if (process.env.UPDATES === 'webhook') {
    await vk.updates.startWebhook({
      tls: null,
    });

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
