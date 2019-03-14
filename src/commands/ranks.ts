import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { RankModel } from '../models/rank';
import { t } from '../translate';

const handler = async (context: MessageContext) => {
  if (process.env.RANKS_SHOW_DISABLED === '1') {
    return context.send(`🔒 ${t('RANKS_SHOW_DISABLED')}`);
  }

  const foundRanks = await RankModel.find().sort({ exp: 1 });

  if (!foundRanks.length) {
    throw new Error('No ranks created in db');
  }

  const ranksList = foundRanks
    .map(r => `▶ ${r.name} - ${r.exp} ${t('EXP')}`)
    .join('\n');
  context.send(`📋 ${t('RANKS_TITLE')}:\n${ranksList}`);
};

const command: Command = {
  name: 'ranks',
  commands: ['/ranks'],
  handler,
};

export default command;
