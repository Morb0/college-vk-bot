import 'dotenv/config';
import './heroku';
import './db';

import { readdirSync } from 'fs';
import { resolve } from 'path';
import { MessageContext, VK } from 'vk-io';

import { addExp } from './functions/add-exp';
import { antiSpam } from './functions/anti-spam';
import { putUser } from './functions/put-user';
import { Command } from './interfaces/command';
import { t } from './translate';

const vk = new VK();

// Setup token
vk.setOptions({
  token: process.env.VK_TOKEN,
  pollingGroupId: +process.env.GROUP_ID,
});

const { updates } = vk;

// Skip outbox message and handle errors
updates.use(
  async (
    context: MessageContext,
    next: (...args: any[]) => any,
  ): Promise<void> => {
    // Skip sent message by self
    if (context.is(['message']) && context.isOutbox) {
      return;
    }

    try {
      // Put user
      await putUser(context, vk);

      // Anti spam
      await antiSpam(context);

      // Add exp
      await addExp(context);

      await next();
    } catch (err) {
      console.error('Error:', err);
    }
  },
);

const hearCommand = (
  name: string,
  conditions: string[],
  handle: (context: MessageContext) => any,
): void => {
  console.log(`Register commands: ${conditions.join(', ')}`);

  updates.hear(
    [
      (text: string) => {
        if (/[club\d+\|?.+\] \/[a-zA-Z0-9А-Яа-я]+/.test(text)) {
          // Check command format
          for (const command of conditions) {
            if (text && text === command) {
              return true;
            }
          }
        }

        return false;
      },
      ...conditions,
    ],
    // Middlewares
    (context: MessageContext) => {
      // Maintenance
      if (process.env.MAINTENANCE === '1') {
        const devPeerIds = process.env.DEV_PEER_IDS.split(',');
        if (devPeerIds.indexOf(context.peerId.toString()) === -1) {
          context.send(`🚧 ${t('MAINTENANCE')}`);
          return;
        }
      }

      handle(context);
    },
  );
};

// Load commands
readdirSync(resolve(__dirname, 'commands')).forEach(async file => {
  try {
    if (!/\.(?:js|ts)$/.test(file)) {
      return;
    }

    const path = resolve(__dirname, 'commands', file);
    const command: Command = (await import(path)).default;
    hearCommand(
      command.name,
      command.conditions,
      async (context: MessageContext) => {
        try {
          await command.handler(context, vk);
        } catch (err) {
          if (err.code === 917) {
            context.send(`❌ ${t('ADMIN_PERMISSION_REQUIRED')}`);
          } else {
            console.error(err);
            context.send(`❌ ${t('UNKNOWN_ERROR')}`);
          }
        }
      },
    );
  } catch (err) {
    console.error('Loading commands error:', err);
    process.exit(1);
  }
});

async function run() {
  if (process.env.UPDATES === 'webhook') {
    await updates.startWebhook({
      tls: null,
    });

    console.log('Webhook server started');
  } else {
    await updates.startPolling();

    console.log('Polling started');
  }
}

run().catch(console.error);
