import config from 'config';
import { createQueryBuilder, LessThanOrEqual } from 'typeorm';
import { MessageContext } from 'vk-io';

import { ChatXP } from '../entity/ChatXP';
import { Rank } from '../entity/Rank';
import { User } from '../entity/User';
import { createMention } from '../utils/mention';
import { t } from '../utils/translate';

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
  const { id: lastRankId } = await Rank.findOne({
    order: { xp: 'DESC' },
    select: ['id'],
  });

  if (!currentRank) {
    throw new Error(`User ${context.senderId} rank not found`);
  }

  if (currentRank.id !== nextRank.id) {
    const foundUser = await User.findOne(
      { vkId: context.senderId },
      { select: ['firstName'] },
    );
    const mention = createMention(context.senderId, foundUser.firstName);

    await context.send(`${mention}, 🎉 ${t('RANK_UP')}: ${nextRank.name}`);

    if (nextRank.id === lastRankId) {
      await createQueryBuilder()
        .update(ChatXP)
        .set({
          xp: () => 0,
          stars: () => 'stars + 1',
        })
        .where({
          vkId: context.senderId,
          chatId: context.chatId,
        })
        .execute();
      context.send(
        `${mention}, 🎉 Вы достигли макс. ранга! Ваш опыт будет сброшен, но вы получите ⭐ ко всем последующим рангам`,
      );
      return;
    }
  }
};

export const accrualXP = async (context: MessageContext) => {
  const gainsXP = calcXPCount(context);
  let currentXP: number;

  const foundChatXP = await ChatXP.findOne({
    vkId: context.senderId,
    chatId: context.chatId,
  });
  currentXP = foundChatXP.xp;
  foundChatXP.xp += gainsXP;
  await foundChatXP.save();

  await checkRankUp(context, currentXP, gainsXP);
};
