import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { t } from '../translate';

const handler = (context: MessageContext) => {
  context.reply(t('HELP'));
};

const command: Command = {
  name: 'help',
  commands: ['/help'],
  handler,
};

export default command;
