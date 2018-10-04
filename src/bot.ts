import * as dotenv from 'dotenv';
import { VK } from 'vk-io';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

dotenv.config();

const ENDPOINT = 'http://simfpolyteh.ru';

const vk = new VK();

// Setup token
vk.setOptions({
   token: process.env.VK_TOKEN,
   pollingGroupId: process.env.GROUP_ID
});

// Skip outbox message and handle errors
vk.updates.use(async (context: any, next: (...args: any[]) => any): Promise<void> => {
	if (context.is('message') && context.isOutbox) {
		return;
	}

	try {
		await next();
	} catch (error) {
		console.error('Error:', error);
	}
});

// Handle message payload
vk.updates.use(async (context: any, next: (...args: any[]) => any): Promise<void> => {
	if (context.is('message')) {
		const { messagePayload } = context;

		context.state.command = messagePayload && messagePayload.command
			? messagePayload.command
			: null;
	}

	await next();
});

const hearCommand = (name: string, conditions: string[], handle: (context: any) => any): void => {
	console.log(`Bot register commands: ${conditions.join(', ')}`);

	vk.updates.hear(
		[
			(text, { state }) => {
				console.log(`New read message: "${text}"`);

				console.log(`State command: ${state.command}`);
				if (state.command === name) {
					return true;
				}

				console.log('Verify of treatment to bot');
				if (/\[club\d+\|?.+\] \/[a-zA-Z0-9А-Яа-я]+/.test(text)) {
					console.log('Check commands');
					for (let command of conditions) {
						if (text.indexOf(command) > -1) {
							return true;
						}
					}
				}

				return false;
			},
			...conditions
		],
		handle
	);
};

hearCommand('hello', ['/hello'], async (context: any) => {
    context.send('Hello!');
});

hearCommand('timetable', ['/tt', '/timetable', '/raspisanie', '/rasp', '/расписание', '/расп'], async (context: any) => {
    // Get image url
	const $ = await rp.get(`${ENDPOINT}/raspisanie`, {
        transform: (body: string) => cheerio.load(body)
    });

    const imageUrl = $('.page_raspis_block_img').find('img').first().attr('src');

    // Get image
    const imgBuffer = await rp.get(imageUrl, { encoding: null });

    // Modify image
    const modifiedImgBuffer = sharp(imgBuffer)
        .extract({ left: 0, top: 558, width: 129, height: 177 }) // Extract table
        .resize(258, 354) // Resize x2
        .toBuffer();
    
    const attachmentPhoto = await vk.upload.messagePhoto({
        source: modifiedImgBuffer
    });

    context.send({
        attachment: attachmentPhoto
    });
});

async function run() {
	if (process.env.UPDATES === 'webhook') {
		await vk.updates.startWebhook();

		console.log('Webhook server started');
	} else {
		await vk.updates.startPolling();

		console.log('Polling started');
	}
}

run().catch(console.error);