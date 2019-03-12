import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command.interface';
import { t } from '../translate';

const handler = (context: MessageContext) => {
  context.send(t('HELP'));
};

const command: Command = {
  name: 'help',
  commands: ['/help'],
  handler,
};

export default command;
