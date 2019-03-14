import config from 'config';
import { MessageContext } from 'vk-io';

import { Rank } from '../interfaces/rank';
import { RankModel } from '../models/rank';
import { UserModel } from '../models/user';
import { t } from '../translate';
import { createMention, findRank } from '../utils';

const calcExp = (context: MessageContext): number => {
  let expCount = 1;
  if (context.is(['gift'])) {
    expCount += config.get('exp.gift');
  } else if (context.is(['sticker'])) {
    expCount += config.get('exp.sticker');
  } else if (context.is(['photo'])) {
    expCount += config.get('exp.photo');
  } else if (context.is(['video'])) {
    expCount += config.get('exp.video');
  } else if (context.is(['audio'])) {
    expCount += config.get('exp.audio');
  }
  return expCount;
};

const checkNewRank = async (
  context: MessageContext,
  expCount: number,
): Promise<Rank | void> => {
  const foundUser = await UserModel.findOne({ id: context.senderId });
  const foundRanks = await RankModel.find().sort({ exp: 1 });
  const curRank = findRank(foundRanks, foundUser.exp);
  const newRank = findRank(foundRanks, foundUser.exp + expCount);

  if (curRank._id !== newRank._id) {
    const mention = createMention(context.senderId, foundUser.firstName);
    context.send(`${mention}, 🎉 ${t('RANK_UP')}: ${newRank.name}`);
  }
};

export const addExp = async (context: MessageContext): Promise<void> => {
  // NOTE: Exp add only from chat messages (anti abuse)
  if (!context.isChat) {
    return;
  }

  const expCount = calcExp(context);
  await checkNewRank(context, expCount);

  await UserModel.updateOne(
    { id: context.senderId },
    {
      $inc: {
        exp: expCount,
      },
    },
  );
};
