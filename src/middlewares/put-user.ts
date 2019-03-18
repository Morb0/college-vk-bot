import { MessageContext } from 'vk-io';

import { User } from '../entity/User';

export const putUser = async (
  context: MessageContext,
  next: () => any,
): Promise<void> => {
  const receivedUser = await context.vk.api.users.get({
    user_ids: context.senderId.toString(),
    fields: 'first_name,last_name',
  });

  if (!context.senderId) {
    console.error('senderId not found', context);
    return;
  }

  const foundUser = await User.findOne({ vkId: context.senderId });
  if (!foundUser) {
    // Add new user
    await User.create({
      vkId: context.senderId,
      firstName: receivedUser[0].first_name,
      lastName: receivedUser[0].last_name,
    }).save();
  } else {
    // Update exist user
    await User.update(foundUser.id, {
      firstName: receivedUser[0].first_name,
      lastName: receivedUser[0].last_name,
    });
  }

  await next();
};
