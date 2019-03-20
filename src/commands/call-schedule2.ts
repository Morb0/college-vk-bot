import { merge } from 'image-glue';
import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getCollegeRawImage } from '../utils/requests';

const handler = async (context: MessageContext) => {
  // Get image
  const [imgBufferTuesday, imgBufferOther] = await Promise.all([
    getCollegeRawImage(
      'http://simfpolyteh.ru/wp-content/themes/politeh/image/Korpus_2_2.png',
    ),
    getCollegeRawImage(
      'http://simfpolyteh.ru/wp-content/themes/politeh/image/Korpus_2_1.png',
    ),
  ]);

  // Combine images
  const combinedImg = await merge([imgBufferOther, imgBufferTuesday]);

  // Send message
  context.sendPhoto(combinedImg);
};

const command: Command = {
  conditions: ['/cs2', '/call2'],
  handler,
};

export default command;
