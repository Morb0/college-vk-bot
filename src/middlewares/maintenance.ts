import { MessageContext } from 'vk-io';

import { t } from '../utils/translate';

export const maintenanceCheck = async (
  context: MessageContext,
  handle: (context: MessageContext) => any,
) => {
  const isMaintenance =
    !!process.env.MAINTENANCE && process.env.MAINTENANCE !== '0';
  if (isMaintenance) {
    const devPeerIds = (process.env.DEV_PEER_IDS || '').split(',');
    if (devPeerIds.indexOf(context.peerId.toString()) === -1) {
      if (process.env.MAINTENANCE === '1') {
        await context.send(`🚧 ${t('MAINTENANCE')}`);
        return;
      }

      if (process.env.MAINTENANCE === '2') {
        return;
      }
    }
  }

  await handle(context);
};
