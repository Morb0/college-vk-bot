import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { UserModel } from '../models/user';
import { t } from '../translate';

const handler = async (context: MessageContext) => {
  const foundUsers = await UserModel.find()
    .sort({ exp: -1 })
    .limit(10)
    .exec();

  const topList = foundUsers
    .map(u => `▶ ${u.firstName} ${u.lastName} - ${u.exp}`)
    .join('\n');
  await context.send(`📋 ${t('RANK_TOP')}:\n${topList}`);
};

const command: Command = {
  conditions: ['/rt', '/rankstop'],
  handler,
};

export default command;
