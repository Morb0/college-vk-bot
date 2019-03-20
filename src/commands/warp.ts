import ms from 'ms';
import Pusher from 'pusher-js';
import * as rp from 'request-promise';
import uuidv4 from 'uuid/v4';
import { MessageContext, MessageForward, MessageForwardsCollection, PhotoAttachment } from 'vk-io';

import { Command } from '../interfaces/command';
import { t } from '../utils/translate';

const ENDPOINT =
  'https://zhktfieuhf.execute-api.eu-west-3.amazonaws.com/budziol/async-invoke-budziol';
const APP_KEY = '834a31567cceaf30da68';
const pusher = new Pusher(APP_KEY, {
  cluster: 'eu',
  encrypted: true,
});
const IS_IN_PERCENTS = 1;
const HEIGHT = 40;
const WIDTH = 40;
const SPEEDUP = 1;

const handler = async (context: MessageContext) => {
  if (!context.hasAttachments('photo') && !context.hasForwards) {
    context.send(`❌ ${t('PHOTO_NOT_FOUND')}`);
    return;
  }

  let attachedPhotos: PhotoAttachment[];
  if (context.hasAttachments('photo')) {
    attachedPhotos = context.getAttachments('photo');
  } else if (context.hasForwards) {
    const findForwardPhotoAttachment = (
      messages: MessageForwardsCollection | MessageForward[],
    ) => {
      for (const message of messages) {
        if (message.hasAttachments('photo')) {
          attachedPhotos = message.getAttachments('photo');
          break;
        }

        if (message.forwards.length) {
          findForwardPhotoAttachment(message.forwards);
        }
      }
    };
    findForwardPhotoAttachment(context.forwards);

    if (!attachedPhotos) {
      context.send(`❌ ${t('PHOTO_NOT_FOUND')}`);
      return;
    }

    context.send(`⚠️ ${t('FIRST_FORWARD_PHOTO')}`);
  }

  const sessionId = uuidv4();

  // Get image
  const imageUrl = attachedPhotos[0].mediumPhoto;
  const imageExt = imageUrl.split('.')[imageUrl.split('.').length - 1];
  const imageBody = await rp.get(imageUrl, { encoding: 'binary' });
  const imageBase64 = Buffer.from(imageBody, 'binary').toString('base64');

  console.log(`New request with sessionId: ${sessionId}`);
  const channel = pusher.subscribe(sessionId);

  channel.bind('img-in-progress', data => {
    console.log(`Processing image ${data.id} started`);
    context.send(`⚙️ ${t('WARP_PROCESSING')} (id: ${data.id})`);
  });

  channel.bind('img-done', async data => {
    console.log(`Image ${data.id} complete (url: ${data.url})`);
    const processedPhoto = await rp.get(data.url, {
      encoding: null,
      timeout: ms('10s'),
    });
    context.sendPhoto(processedPhoto, {
      message: `✔️ ${t('WARP_SUCCESS')} (id: ${data.id})`,
    });
  });

  // Send image
  await rp
    .post(ENDPOINT, {
      body: JSON.stringify({
        ext: imageExt,
        img: imageBase64,
        params: [
          `-height=${HEIGHT}`,
          `-width=${WIDTH}`,
          `-perc=${IS_IN_PERCENTS}`,
        ],
        sessionId,
        speedup: SPEEDUP,
      }),
    })
    .then(() => {
      console.log('Request for processing photo sent');
    })
    .catch(err => {
      console.error('Warp image error', err);
      context.send(`❌ ${t('COMMAND_UNKNOWN_ERROR')}`);
    });

  // Wait result
  // channel.bind('img-done', async data => {
  //   console.log(`Image ${data.id} complete! (url: ${data.url})`);
  //   const processedPhoto = await rp.get(data.url);
  //   const
  //   context.send(`✔️ ${t('WARP_SUCCESS')} (id: ${data.id})`);
  // });

  // channel.bind('img-in-progress', data => {
  //   console.log(`Processing image ${data.id} started.`);
  //   context.send(`⚙️ ${t('WARP_PROCESSING')} (id: ${data.id})`);

  //   // setTimeout(() => {
  //   //   if (dis.$store.state.receivedImgs.find(it => it.id === data.id).url === '') {
  //   //     dis.$store.commit("DELETE_IMG_IN_PROGRESS", data.id);
  //   //     this.$toasted.global.error(`Image ${data.id} took too long to process. (Lambda timeout)`)
  //   //   }
  //   // }, ms('5m'))
  // });
};

const command: Command = {
  conditions: ['/w', '/warp'],
  handler,
};

export default command;
