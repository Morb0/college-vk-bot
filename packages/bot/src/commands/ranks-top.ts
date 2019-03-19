import { Equal } from 'typeorm';
import { MessageContext } from 'vk-io';

import { ChatXP } from '../entity/ChatXP';
import { User } from '../entity/User';
import { Command } from '../interfaces/command';
import { t } from '../utils/translate';

const handler = async (context: MessageContext) => {
  if (!context.isChat) {
    context.send(`⚠️ ${t('ONLY_FROM_CHAT')}`);
    return;
  }

  const foundChatsXP = await ChatXP.find({
    where: { chatId: Equal(context.peerId) },
    order: { xp: 'DESC' },
    take: 10,
  });

  let topList = '';
  for (const chatXP of foundChatsXP) {
    const foundUser = await User.findOne({ vkId: chatXP.vkId });
    topList += `▶ ${foundUser.firstName} ${foundUser.lastName} - ${
      chatXP.xp
    } ${t('XP')}\n`;
  }

  await context.send(`
    📋 ${t('RANK_TOP')}:
    ${topList}
  `);
};

const command: Command = {
  conditions: ['/rt', '/rankstop'],
  handler,
};

export default command;
