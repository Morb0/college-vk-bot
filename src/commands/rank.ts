import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { RankModel } from '../models/rank';
import { UserModel } from '../models/user';
import { t } from '../translate';

const handler = async (context: MessageContext) => {
  const foundUser = await UserModel.findOne({ id: context.senderId });
  const foundRanks = await RankModel.find();

  if (!foundRanks.length) {
    throw new Error('No ranks created in db');
  }

  const userRank = foundRanks.find(r => foundUser.exp > r.exp);
  context.send(`${t('MY_RANK')} ${userRank.name}`);
};

const command: Command = {
  name: 'myRank',
  commands: ['/mr', '/myrank'],
  handler,
};

export default command;
