import config from 'config';
import { MessageContext } from 'vk-io';

import { UserModel } from '../models/user';
import { t } from '../translate';
import { createMention } from '../utils';

const senders = [];
const messages = [];
const warned = [];
const penalized = [];
const warnUser = async (context: MessageContext): Promise<void> => {
  warned.push(context.senderId);
  const foundUser = await UserModel.findOne({ id: context.senderId }).exec();
  const mention = createMention(context.senderId, foundUser.firstName);
  context.send(`${mention}, 🚨 ${t('SPAM_WARNING')}`);
};

const penalizeUser = async (
  context: MessageContext,
  penalizeExpCount: number,
): Promise<void> => {
  const foundUser = await UserModel.findOne({ id: context.senderId }).exec();
  if (foundUser.exp > penalizeExpCount) {
    penalized.push(context.senderId);
    const mention = createMention(context.senderId, foundUser.firstName);
    await context.send(
      `${mention}, 🚨 ${t('SPAM_PENALIZE')}: ${penalizeExpCount} ${t('EXP')}`,
    );
    await UserModel.findByIdAndUpdate(foundUser._id, {
      $inc: {
        exp: -penalizeExpCount,
      },
    }).exec();
  }
};

export const antiSpam = async (
  context: MessageContext,
  next: () => any,
): Promise<void> => {
  const currentTime = Date.now();
  const settings = config.get('antiSpam');
  senders.push({
    time: currentTime,
    sender: context.senderId,
  });
  messages.push({
    text: context.text,
    sender: context.senderId,
  });

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
    msgMatch === settings.maxDuplicatesWarning &&
    !warned.includes(context.senderId)
  ) {
    await warnUser(context);
  }

  if (
    msgMatch === settings.maxDuplicatesPenalize &&
    !penalized.includes(context.senderId)
  ) {
    await penalizeUser(context, settings.penalizeExpCount);
  }

  let matched = 0;
  for (const key in senders) {
    if (senders[key].time > currentTime - settings.interval) {
      matched++;
      if (
        matched == settings.warnBuffer &&
        !warned.includes(context.senderId)
      ) {
        await warnUser(context);
      } else if (matched == settings.penalizeBuffer) {
        if (!penalized.includes(context.senderId)) {
          await penalizeUser(context, settings.penalizeExpCount);
        }
      }
    } else if (senders[key].time < currentTime - settings.interval) {
      senders.splice(+key);
      warned.splice(warned.indexOf(senders[key]));
      penalized.splice(penalized.indexOf(senders[key]));
    }

    if (messages.length >= 200) {
      messages.shift();
    }
  }

  await next();
};
