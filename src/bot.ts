import 'dotenv/config';
// import './heroku';
import './db';

import { readdirSync } from 'fs';
import { resolve } from 'path';
import { MessageContext, VK } from 'vk-io';

import { Command } from './interfaces/command';
import { addExp } from './middlewares/add-exp';
import { antiSpam } from './middlewares/anti-spam';
import { maintenanceCheck } from './middlewares/maintenance';
import { putUser } from './middlewares/put-user';
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
    if (context.is(['message']) && (context.isOutbox || context.senderId < 0)) {
      return;
    }

    try {
      await next();
    } catch (err) {
      console.error('Error:', err);
    }
  },
);

updates.on('message', putUser);
updates.on('message', antiSpam);

const hearMiddleware = (handle: (context: MessageContext) => any) => (
  context: MessageContext,
) => {
  return maintenanceCheck(context, handle);
};

const hearCommand = (
  conditions: string[],
  handle: (context: MessageContext) => any,
) => {
  console.log(`Register conditions: ${conditions.join(', ')}`);

  // Using 'as any' - https://github.com/negezor/vk-io/issues/138
  updates.hear(conditions as any, hearMiddleware(handle));
};

// Load commands
readdirSync(resolve(__dirname, 'commands')).forEach(async file => {
  try {
    if (!/\.(?:js|ts)$/.test(file)) {
      return;
    }

    const path = resolve(__dirname, 'commands', file);
    const command: Command = (await import(path)).default;
    hearCommand(command.conditions, async (context: MessageContext) => {
      try {
        await command.handler(context, vk);
      } catch (err) {
        if (err.code === 917) {
          await context.send(`❌ ${t('ADMIN_PERMISSION_REQUIRED')}`);
        } else {
          console.error(err);
          await context.send(`❌ ${t('UNKNOWN_ERROR')}`);
        }
      }
    });
  } catch (err) {
    console.error('Loading commands error:', err);
    process.exit(1);
  }
});

updates.setHearFallbackHandler(async (context: MessageContext) => {
  // Add exp only for not command messages
  await addExp(context);
});

async function run() {
  await updates.startPolling();
  console.log('Polling started');
}

run().catch(console.error);
