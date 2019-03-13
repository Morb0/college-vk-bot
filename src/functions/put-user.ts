import VK, { MessageContext } from 'vk-io';

import { UserModel } from '../models/user';

export const putUser = async (
  context: MessageContext,
  vk: VK,
): Promise<void> => {
  const receivedUser = await vk.api.users.get({
    user_ids: context.senderId.toString(),
    fields: 'first_name,last_name',
  });

  if (!context.senderId) {
    console.error('senderId not found', context);
    return;
  }

  const foundUser = await UserModel.findOne({ id: context.senderId });
  if (!foundUser) {
    // Add new user
    await UserModel.create({
      id: context.senderId,
      firstName: receivedUser[0].first_name,
      lastName: receivedUser[0].last_name,
    });
  } else {
    // Update exist user
    await UserModel.findByIdAndUpdate(foundUser._id, {
      firstName: receivedUser[0].first_name,
      lastName: receivedUser[0].last_name,
    });
  }
};
