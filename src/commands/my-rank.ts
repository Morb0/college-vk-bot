import { LessThanOrEqual } from 'typeorm';
import { MessageContext } from 'vk-io';

import { Rank } from '../entity/Rank';
import { User } from '../entity/User';
import { Command } from '../interfaces/command';
import { t } from '../translate';

const handler = async (context: MessageContext) => {
  const foundUser = await User.findOne({ vkId: context.senderId });
  const currentRank = await Rank.findOne({
    order: { xp: 'DESC' },
    where: { xp: LessThanOrEqual(foundUser.xp) },
  });
  const nextRank = await Rank.findOne({ id: currentRank.id + 1 });

  await context.send(`
    ℹ ${t('MY_RANK')} ${currentRank.name}
    ${
      !nextRank
        ? `🎉 ${t('RANK_MAX')}`
        : `📈 ${t('RANK_UP_REMAIN')}: ${foundUser.xp}/${nextRank.xp} ${t(
            'EXP',
          )}`
    }
  `);
};

const command: Command = {
  conditions: ['/r', '/myrank'],
  handler,
};

export default command;
