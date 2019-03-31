import ms from 'ms';
import sharp from 'sharp';
import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getCheerioContent, getCollegeRawImage } from '../utils/requests';
import { t } from '../utils/translate';

const timeouts: { [key: string]: number } = {};
const handler = async (context: MessageContext) => {
  // Timeout check
  if (Date.now() < timeouts[context.peerId]) {
    await context.send(
      `⌛ ${t('TIMETABLE_TIMEOUT')} (${ms(
        timeouts[context.peerId] - Date.now(),
      )})`,
    );
    return;
  }
  timeouts[context.peerId] = Date.now() + ms('1m');

  // Get image url
  const fakeImage = !!process.env.FAKE_TT_IMAGE;
  let imageUrl;

  if (fakeImage) {
    imageUrl = process.env.FAKE_TT_IMAGE;
  } else {
    const $ = await getCheerioContent('http://simfpolyteh.ru/raspisanie');
    imageUrl = $('.page_raspis_block_img')
      .find('img')
      .first()
      .attr('src');
  }

  // Get image
  const imgBuffer = await getCollegeRawImage(imageUrl);

  let modifiedImgBuffer;
  if (!fakeImage) {
    // Load to sharp
    const sharpImg = sharp(imgBuffer);

    // Check image size
    const imgInfo = await sharpImg.metadata();

    // Modify image
    modifiedImgBuffer = await sharpImg
      .extract({
        left: 0,
        top: imgInfo.height - 177, // calculated image size
        width: 129,
        height: 177,
      }) // Extract table
      .resize(258, 354) // Resize x2
      .toBuffer();
  }

  // Send photo
  const attachmentPhoto = await context.vk.upload.messagePhoto({
    source: fakeImage ? imgBuffer : modifiedImgBuffer,
  });
  context.send({
    attachment: attachmentPhoto,
  });
};

const command: Command = {
  conditions: [
    '/tt',
    '/timetable',
    '/raspisanie',
    '/rasp',
    '/расписание',
    '/расп',
  ],
  handler,
};

export default command;
