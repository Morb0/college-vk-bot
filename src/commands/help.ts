import { Command, CommandHelpCategory } from '../core/command/command';
import { CommandLoader } from '../core/command/command-loader';
import { HelpMessageComposer } from '../utils/help-message-composer';
import { MessageContext } from 'vk-io';

class HelpCommand extends Command {
  constructor() {
    super('help', ['help'], CommandHelpCategory.Other, 'Помощь в использовании бота');
  }
  
  execute(ctx: MessageContext): void {
    const commandLoader = CommandLoader.getInstance();
    const commands = commandLoader.getAll();
    const helpMessageComposer = new HelpMessageComposer(commands);
    const message = helpMessageComposer.composeMessage();
    ctx.send(message);
  }
}

export default new HelpCommand();