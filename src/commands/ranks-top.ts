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
    where: { chatId: Equal(context.chatId) },
    order: { xp: 'DESC' },
    take: 10,
  });

  let emojiNums = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  let topList = '';
  for (const key in foundChatsXP) {
    const foundUser = await User.findOne({ vkId: foundChatsXP[key].vkId });
    topList += `${emojiNums[key]} ${foundUser.firstName} ${
      foundUser.lastName
    }${!!foundChatsXP[key].stars &&
      new Array(foundChatsXP[key].stars + 1).join('⭐') + ' '}- ${
      foundChatsXP[key].xp
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
