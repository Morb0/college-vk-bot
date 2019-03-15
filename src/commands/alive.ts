import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';

const handler = (context: MessageContext) => {
  context.sendSticker(9046);
};

const command: Command = {
  name: 'alive',
  conditions: ['/alive'],
  handler,
};

export default command;
