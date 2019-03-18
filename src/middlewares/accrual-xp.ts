import config from 'config';
import { LessThanOrEqual } from 'typeorm';
import { MessageContext } from 'vk-io';

import { Rank } from '../entity/Rank';
import { User } from '../entity/User';
import { t } from '../translate';
import { createMention } from '../utils';

const calcXPCount = (context: MessageContext): number => {
  const messageTypeXP = config.get('messageTypeXP') as any;
  let xpCount = 1;
  for (const type in messageTypeXP) {
    if (context.is([type])) {
      xpCount += messageTypeXP[type];
    }
  }
  return xpCount;
};

const checkRankUp = async (
  context: MessageContext,
  user: User,
  xpCount: number,
) => {
  const currentRank = await Rank.findOne({
    order: { xp: 'DESC' },
    where: { xp: LessThanOrEqual(user.xp) },
  });
  const nextRank = await Rank.findOne({
    order: { xp: 'DESC' },
    where: { xp: LessThanOrEqual(user.xp + xpCount) },
  });

  if (!currentRank) {
    throw new Error(`User ${user.vkId} rank not found`);
  }

  if (!nextRank) {
    // MAX Level up
    return;
  }

  if (currentRank.id !== nextRank.id) {
    const mention = createMention(context.senderId, user.firstName);
    await context.send(`${mention}, 🎉 ${t('RANK_UP')}: ${nextRank.name}`);
  }
};

export const accrualXP = async (context: MessageContext) => {
  // NOTE: XP add only from chat (conversations) messages (anti abuse)
  if (!context.isChat) {
    return;
  }

  const foundUser = await User.findOne({ vkId: context.senderId });
  if (!foundUser) {
    throw new Error(`User ${context.senderId} not found in db`);
  }

  const receivedXP = calcXPCount(context);
  foundUser.xp += receivedXP;
  await foundUser.save();

  await checkRankUp(context, foundUser, receivedXP);
};
