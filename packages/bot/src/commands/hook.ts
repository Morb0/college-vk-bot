import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { getRandomInt } from '../utils/random-int';

const handler = async (context: MessageContext) => {
  const members = await context.vk.api.messages.getConversationMembers({
    peer_id: context.peerId,
  });

  // Get random profile
  const randomProfile =
    members.profiles[getRandomInt(0, members.profiles.length)];

  await context.send(
    `🎣 Get over here - ${randomProfile.first_name} ${randomProfile.last_name}`,
  );
};

const command: Command = {
  conditions: ['/h', '/hook'],
  handler,
};

export default command;
