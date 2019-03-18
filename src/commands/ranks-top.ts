import { MessageContext } from 'vk-io';

import { User } from '../entity/User';
import { Command } from '../interfaces/command';
import { t } from '../translate';

const handler = async (context: MessageContext) => {
  const foundUsers = await User.find({ order: { xp: 'DESC' }, take: 10 });

  await context.send(`
    📋 ${t('RANK_TOP')}:
    ${foundUsers
      .map(u => `▶ ${u.firstName} ${u.lastName} - ${u.xp}`)
      .join('\n')}
  `);
};

const command: Command = {
  conditions: ['/rt', '/rankstop'],
  handler,
};

export default command;
