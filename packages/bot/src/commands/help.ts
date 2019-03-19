import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { t } from '../utils/translate';

const handler = async (context: MessageContext) => {
  await context.send(t('HELP'));
};

const command: Command = {
  conditions: ['/help'],
  handler,
};

export default command;
