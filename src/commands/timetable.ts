import sharp from 'sharp';
import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command.interface';
import { getCheerioContent, getRawImage } from '../utils';

const handler = async (context: MessageContext) => {
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

  context.sendPhoto(modifiedImgBuffer);
};

const command: Command = {
  name: 'timetable',
  commands: [
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
