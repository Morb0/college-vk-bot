import config from 'config';
import { LessThanOrEqual } from 'typeorm';
import { MessageContext } from 'vk-io';

import { ChatXP } from '../entity/ChatXP';
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
  currentXP: number,
  gainsXP: number,
) => {
  const currentRank = await Rank.findOne({
    order: { xp: 'DESC' },
    where: { xp: LessThanOrEqual(currentXP) },
  });
  const nextRank = await Rank.findOne({
    order: { xp: 'DESC' },
    where: { xp: LessThanOrEqual(currentXP + gainsXP) },
  });

  if (!currentRank) {
    throw new Error(`User ${context.senderId} rank not found`);
  }

  if (!nextRank) {
    // MAX Level up
    return;
  }

  if (currentRank.id !== nextRank.id) {
    const foundUser = await User.findOne(
      { vkId: context.senderId },
      { select: ['firstName'] },
    );
    const mention = createMention(context.senderId, foundUser.firstName);
    await context.send(`${mention}, 🎉 ${t('RANK_UP')}: ${nextRank.name}`);
  }
};

export const accrualXP = async (context: MessageContext) => {
  // NOTE: XP add only from chat (conversations) messages (anti abuse)
  if (!context.isChat) {
    return;
  }

  const gainsXP = calcXPCount(context);
  let currentXP: number;

  const foundChatXP = await ChatXP.findOne({
    vkId: context.senderId,
    chatId: context.peerId,
  });
  if (!foundChatXP) {
    currentXP = gainsXP;
    await ChatXP.create({
      vkId: context.senderId,
      chatId: context.peerId,
      xp: gainsXP,
    }).save();
  } else {
    currentXP = foundChatXP.xp;
    foundChatXP.xp += gainsXP;
    await foundChatXP.save();
  }

  await checkRankUp(context, currentXP, gainsXP);
};
