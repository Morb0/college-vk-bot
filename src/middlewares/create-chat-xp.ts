import { MessageContext } from 'vk-io';

import { ChatXP } from '../entity/ChatXP';

export const createChatXP = async (
  context: MessageContext,
  next: () => any,
): Promise<void> => {
  const foundChatXP = await ChatXP.findOne({
    vkId: context.senderId,
  });
  if (!foundChatXP) {
    // Add new chat
    await ChatXP.create({
      vkId: context.senderId,
      chatId: context.peerId,
    }).save();
  }

  await next();
};
