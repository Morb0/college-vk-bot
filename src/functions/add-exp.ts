import { MessageContext } from 'vk-io';

import { Rank } from '../interfaces/rank';
import { RankModel } from '../models/rank';
import { UserModel } from '../models/user';
import { t } from '../translate';
import { findRank } from '../utils';

const calcExp = (context: MessageContext): number => {
  let expCount = 1;
  if (context.is(['gift'])) {
    expCount += 10;
  } else if (context.is(['sticker'])) {
    expCount += 1;
  } else if (
    context.is(['photo']) ||
    context.is(['video']) ||
    context.is(['audio'])
  ) {
    expCount += 2;
  }
  return expCount;
};

const checkNewRank = async (
  context: MessageContext,
  expCount: number,
): Promise<Rank | void> => {
  const foundUser = await UserModel.findOne({ id: context.senderId });
  const foundRanks = await RankModel.find();
  const curRank = findRank(foundRanks, foundUser.exp);
  const newRank = findRank(foundRanks, foundUser.exp + expCount);

  if (curRank._id !== newRank._id) {
    context.send(`🎉 ${t('RANK_UP')}: ${newRank.name}`);
  }
};

export const addExp = async (context: MessageContext): Promise<void> => {
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
