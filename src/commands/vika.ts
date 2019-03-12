import ms from 'ms';
import VK, { AudioAttachment, MessageContext } from 'vk-io';

import { Command } from '../interfaces/command.interface';
import { getRandomInt, getRawImage } from '../utils';

let timeout;
const handler = async (context: MessageContext, vk: VK) => {
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

  if (Date.now() < timeout) {
    context.send(
      `⌛ Arthas takes out the f**king trash (${ms(timeout - Date.now())})`,
    );
    return;
  }
  timeout = Date.now() + ms('2h');

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
};

const command: Command = {
  name: 'vika',
  commands: ['/vika', '/roflan'],
  handler,
};

export default command;
