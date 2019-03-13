import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';

const handler = (context: MessageContext) => {
  context.reply({
    sticker_id: 9046,
  });
};

const command: Command = {
  name: 'alive',
  commands: ['/alive'],
  handler,
};

export default command;
