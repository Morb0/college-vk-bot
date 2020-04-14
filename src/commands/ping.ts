import { Command, CommandHelpCategory } from '../core/command/command';
import { MessageContext } from 'vk-io';

class PingCommand extends Command {
  constructor() {
    super('ping', ['ping'], CommandHelpCategory.Other, 'Проверяет статус бота');
  }
  
  execute(ctx: MessageContext): void {
    ctx.send('pong');
  }
}

export default new PingCommand();