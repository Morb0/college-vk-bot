import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getXHRContent } from '../utils/requests';
import { t } from '../utils/translate';

const handler = async (context: MessageContext) => {
  const randomFact = await getXHRContent('https://randstuff.ru/fact/generate');

  // Send message
  await context.send(`${t('FACT')}: ${randomFact.fact.text}`);
};

const command: Command = {
  conditions: ['/f', '/fact'],
  handler,
};

export default command;
