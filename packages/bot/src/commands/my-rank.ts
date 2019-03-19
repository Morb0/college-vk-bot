import { LessThanOrEqual } from 'typeorm';
import { MessageContext } from 'vk-io';

import { ChatXP } from '../entity/ChatXP';
import { Rank } from '../entity/Rank';
import { Command } from '../interfaces/command';
import { t } from '../utils/translate';

const handler = async (context: MessageContext) => {
  if (!context.isChat) {
    context.send(`⚠️ ${t('ONLY_FROM_CHAT')}`);
    return;
  }

  const foundChatXP = await ChatXP.findOne({
    vkId: context.senderId,
    chatId: context.peerId,
  });
  const currentRank = await Rank.findOne({
    order: { xp: 'DESC' },
    where: { xp: LessThanOrEqual(foundChatXP.xp) },
  });
  const nextRank = await Rank.findOne({ id: currentRank.id + 1 });

  await context.send(`
    ℹ ${t('MY_RANK')} ${currentRank.name}
    ${
      !nextRank
        ? `🎉 ${t('RANK_MAX')}`
        : `📈 ${t('RANK_UP_REMAIN')}: ${foundChatXP.xp}/${nextRank.xp} ${t(
            'XP',
          )}`
    }
  `);
};

const command: Command = {
  conditions: ['/r', '/myrank'],
  handler,
};

export default command;
