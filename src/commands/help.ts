import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { t } from '../translate';

const handler = (context: MessageContext) => {
  context.send(t('HELP'));
};

const command: Command = {
  conditions: ['/help'],
  handler,
};

export default command;
