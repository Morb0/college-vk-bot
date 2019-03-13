import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getXHRContent } from '../utils';

const handler = async (context: MessageContext) => {
  const randomFact = await getXHRContent('https://randstuff.ru/fact/generate');

  // Send message
  context.reply(randomFact.fact.text);
};

const command: Command = {
  name: 'fact',
  commands: ['/f', '/fact'],
  handler,
};

export default command;
