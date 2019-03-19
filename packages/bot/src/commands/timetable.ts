import ms from 'ms';
import sharp from 'sharp';
import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getCheerioContent, getRawImage } from '../utils/requests';
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
  const $ = await getCheerioContent('http://simfpolyteh.ru/raspisanie');

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

  // Send message
  context.sendPhoto(modifiedImgBuffer);
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
