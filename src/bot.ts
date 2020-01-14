import 'reflect-metadata';
import 'dotenv/config';

import { readdirSync } from 'fs';
import { resolve } from 'path';
import { MessageContext, VK } from 'vk-io';

import { Command } from './interfaces/command';
import { accrualXP } from './middlewares/accrual-xp';
// import { antiSpam } from './middlewares/anti-spam';
import { createChatXP } from './middlewares/create-chat-xp';
import { maintenanceCheck } from './middlewares/maintenance';
import { putUser } from './middlewares/put-user';
import { connectDb } from './utils/db';
import { t } from './utils/translate';

const vk = new VK();

if (!process.env.VK_TOKEN || !process.env.GROUP_ID) {
  throw new Error('Env VK_TOKEN and GROUP_ID required');
}

// Setup token
vk.setOptions({
  token: process.env.VK_TOKEN,
  pollingGroupId: +process.env.GROUP_ID,
});

// Skip outbox message and handle errors
vk.updates.use(
  async (
    context: MessageContext,
    next: (...args: any[]) => any,
  ): Promise<void> => {
    // Skip sent message by self
    if (context.is(['message']) && (context.isOutbox || !context.isUser)) {
      return;
    }

    await next();
  },
);

vk.updates.on('message', putUser);
vk.updates.on('message', createChatXP);

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
  vk.updates.hear(conditions, hearMiddleware(handle));
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
        await command.handler(context);
      } catch (err) {
        console.error(err);
        await context.send(`❌ ${t('COMMAND_UNKNOWN_ERROR')}`);
      }
    });
  } catch (err) {
    console.error('Loading commands error:', err);
    process.exit(1);
  }
});

vk.updates.setHearFallbackHandler(async (context: MessageContext) => {
  try {
    // NOTE: XP add only from chat (conversations) messages (anti abuse)
    if (context.isChat) {
      // Anti spam only for text messages
      // await antiSpam(context);
      // Accrual exp only for not command messages
      await accrualXP(context);
    }
  } catch (err) {
    console.error(err);
    await context.send(`❌ ${t('UNKNOWN_ERROR')}`);
  }
});

async function run() {
  await connectDb();
  console.log('Database connection successful');
  await vk.updates.startPolling();
  console.log('Polling started');
}

run().catch(console.error);
