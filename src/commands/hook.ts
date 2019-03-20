import { MessageContext } from 'vk-io';

import { ChatXP } from '../entity/ChatXP';
import { User } from '../entity/User';
import { Command } from '../interfaces/command';
import { getRandomInt } from '../utils/random-int';
import { t } from '../utils/translate';

const handler = async (context: MessageContext) => {
  if (!context.isChat) {
    context.send(`⚠️ ${t('ONLY_FROM_CHAT')}`);
    return;
  }

  const foundChatUsers = await ChatXP.find({
    select: ['vkId'],
    where: {
      chatId: context.chatId,
    },
  });

  if (!foundChatUsers.length) {
    context.send(`⚠️ ${t('NO_ACTIVE_USER')}`);
    return;
  }

  // Get random profile
  const randomVkId =
    foundChatUsers[getRandomInt(0, foundChatUsers.length)].vkId;
  const foundUser = await User.findOne({ vkId: randomVkId });

  await context.send(
    `🎣 Get over here - ${foundUser.firstName} ${foundUser.lastName}`,
  );
};

const command: Command = {
  conditions: ['/h', '/hook'],
  handler,
};

export default command;
