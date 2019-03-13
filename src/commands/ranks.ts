import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command';
import { RankModel } from '../models/rank';
import { t } from '../translate';

const handler = async (context: MessageContext) => {
  const foundRanks = await RankModel.find();

  if (!foundRanks.length) {
    throw new Error('No ranks created in db');
  }

  context.send(
    foundRanks.map(r => `${r.name} - ${r.exp} ${t('EXP')}`).join('\n'),
  );
};

const command: Command = {
  name: 'ranks',
  commands: ['/ranks'],
  handler,
};

export default command;
