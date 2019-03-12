import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command.interface';

const handler = (context: MessageContext) => {
  context.sendSticker(9046);
};

const command: Command = {
  name: 'alive',
  commands: ['/alive'],
  handler,
};

export default command;
