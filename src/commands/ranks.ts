import { MessageContext } from 'vk-io';

import { Rank } from '../entity/Rank';
import { Command } from '../interfaces/command';
import { t } from '../utils/translate';

const handler = async (context: MessageContext): Promise<void> => {
  if (process.env.RANKS_SHOW_DISABLED === '1') {
    await context.send(`🔒 ${t('RANKS_SHOW_DISABLED')}`);
    return;
  }

  const foundRanks = await Rank.find({ order: { xp: 'ASC' } });

  if (!foundRanks.length) {
    throw new Error('Not found ranks in db');
  }

  await context.send(`
    📋 ${t('RANKS_TITLE')}:
    ${foundRanks.map(r => `▶ ${r.name} - ${r.xp} ${t('XP')}`).join('\n')}
  `);
};

const command: Command = {
  conditions: ['/ranks'],
  handler,
};

export default command;
