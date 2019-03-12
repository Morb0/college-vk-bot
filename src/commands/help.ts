import { MessageContext } from 'vk-io';

import { Command } from '../interfaces/command.interface';

const handler = (context: MessageContext) => {
  context.send(`
  📋 List of available commands:
  ➡ /help - Show available commands
  ➡ /alive - Check bot status
  ➡ /tt - Give available time table
  ➡ /cs1 - Give call schedule for first block
  ➡ /cs2 - Give call schedule for second block
  ➡ /fact - Give random fact from list
  ➡ /hook - Hook random chat user (Admin permissions only)
  ➡ /vika - Command for fun
`);
};

const command: Command = {
  name: 'help',
  commands: ['/help'],
  handler,
};

export default command;
