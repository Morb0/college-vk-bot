import config from 'config';
import { MessageContext } from 'vk-io';

import { ChatXP } from '../entity/ChatXP';
import { User } from '../entity/User';
import { createMention } from '../utils/mention';
import { t } from '../utils/translate';

const senders: { time: number; sender: number }[] = [];
const messages: { text: string; sender: number }[] = [];
const warned: number[] = [];
const penalized: number[] = [];
const warnUser = async (context: MessageContext): Promise<void> => {
  warned.push(context.senderId);
  const foundUser = await User.findOne(
    { vkId: context.senderId },
    { select: ['firstName'] },
  );
  const mention = createMention(context.senderId, foundUser.firstName);
  context.send(`${mention}, 🚨 ${t('SPAM_WARNING')}`);
};

const penalizeUser = async (
  context: MessageContext,
  penalizeExpCount: number,
): Promise<void> => {
  const foundChatXP = await ChatXP.findOne({
    vkId: context.senderId,
    chatId: context.peerId,
  });
  if (foundChatXP.xp > penalizeExpCount) {
    penalized.push(context.senderId);
    const foundUser = await User.findOne(
      { vkId: context.senderId },
      { select: ['firstName'] },
    );
    const mention = createMention(context.senderId, foundUser.firstName);
    await context.send(
      `${mention}, 🚨 ${t('SPAM_PENALIZE')}: ${penalizeExpCount} ${t('XP')}`,
    );
    foundChatXP.xp -= penalizeExpCount;
    await foundChatXP.save();
  }
};

export const antiSpam = async (context: MessageContext): Promise<void> => {
  const currentTime = Date.now();
  senders.push({
    time: currentTime,
    sender: context.senderId,
  });
  if (!!context.text) {
    messages.push({
      text: context.text,
      sender: context.senderId,
    });
  }

  let msgMatch = 0;
  for (const message of messages) {
    if (
      message.text.includes(context.text) &&
      message.sender === context.senderId
    ) {
      msgMatch++;
    }
  }

  if (
    msgMatch === config.get('antiSpam.maxDuplicatesWarning') &&
    !warned.includes(context.senderId)
  ) {
    await warnUser(context);
  }

  if (
    msgMatch === config.get('antiSpam.maxDuplicatesPenalize') &&
    !penalized.includes(context.senderId)
  ) {
    await penalizeUser(context, config.get('antiSpam.penalizeExpCount'));
  }

  let matched = 0;
  for (const key in senders) {
    if (
      senders[key].time >
      currentTime - (config.get('antiSpam.interval') as number)
    ) {
      matched++;
      if (
        matched == config.get('antiSpam.warnBuffer') &&
        !warned.includes(context.senderId)
      ) {
        await warnUser(context);
      } else if (matched == config.get('antiSpam.penalizeBuffer')) {
        if (!penalized.includes(context.senderId)) {
          await penalizeUser(context, config.get('antiSpam.penalizeExpCount'));
        }
      }
    } else if (
      senders[key].time <
      currentTime - (config.get('antiSpam.interval') as number)
    ) {
      warned.splice(warned.indexOf(senders[key].sender));
      penalized.splice(penalized.indexOf(senders[key].sender));
      senders.splice(+key);
    }

    if (messages.length >= 200) {
      messages.shift();
    }
  }
};
