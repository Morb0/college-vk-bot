import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { RankModel } from '../models/rank';
import { UserModel } from '../models/user';
import { t } from '../translate';
import { findRank } from '../utils';

const handler = async (context: MessageContext) => {
  const foundUser = await UserModel.findOne({ id: context.senderId });
  const foundRanks = await RankModel.find().sort({ exp: 1 });

  if (!foundRanks.length) {
    throw new Error('No ranks created in db');
  }

  const curRank = findRank(foundRanks, foundUser.exp);
  const nextRankIndex = foundRanks.findIndex(r => r._id === curRank._id);
  const nextRank = foundRanks[nextRankIndex + 1];
  let rankUpRemainText = '';
  if (!nextRank) {
    rankUpRemainText = `🎉 ${t('RANK_MAX')}`;
  } else {
    rankUpRemainText = `📈 ${t('RANK_UP_REMAIN')}: ${foundUser.exp}/${
      nextRank.exp
    } ${t('EXP')}`;
  }

  context.reply(`ℹ ${t('MY_RANK')} ${curRank.name}\n ${rankUpRemainText}`);
};

const command: Command = {
  name: 'myRank',
  commands: ['/r', '/myrank'],
  handler,
};

export default command;
