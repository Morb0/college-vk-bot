import { merge } from 'image-glue';
import VK, { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getRawImage } from '../utils';

const handler = async (context: MessageContext, vk: VK) => {
  // Get image
  const [imgBufferTuesday, imgBufferOther] = await Promise.all([
    getRawImage(
      'http://simfpolyteh.ru/wp-content/themes/politeh/image/Korpus_1_2.png',
    ),
    getRawImage(
      'http://simfpolyteh.ru/wp-content/themes/politeh/image/Korpus_1_1.png',
    ),
  ]);

  // Combine images
  const combinedImg = await merge([imgBufferOther, imgBufferTuesday]);

  // Send message
  const attachmentPhoto = await vk.upload.messagePhoto({
    source: combinedImg,
  });

  context.reply({
    attachment: attachmentPhoto.toString(),
  });
};

const command: Command = {
  name: 'callSchedule1',
  commands: ['/cs1', '/call1'],
  handler,
};

export default command;
