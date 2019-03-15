import { merge } from 'image-glue';
import VK, { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getRawImage } from '../utils';

const handler = async (context: MessageContext, vk: VK) => {
  // Get image
  const [imgBufferTuesday, imgBufferOther] = await Promise.all([
    getRawImage(
      'http://simfpolyteh.ru/wp-content/themes/politeh/image/Korpus_2_2.png',
    ),
    getRawImage(
      'http://simfpolyteh.ru/wp-content/themes/politeh/image/Korpus_2_1.png',
    ),
  ]);

  // Combine images
  const combinedImg = await merge([imgBufferOther, imgBufferTuesday]);

  // Send message
  context.sendPhoto(combinedImg);
};

const command: Command = {
  name: 'callSchedule2',
  conditions: ['/cs2', '/call2'],
  handler,
};

export default command;
