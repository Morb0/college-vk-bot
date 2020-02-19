import { Command } from '../classes/command';
import { MessageContext } from 'vk-io';

export class PingCommand extends Command {
  constructor() {
    super('ping', ['ping']);
  }
  
  execute(ctx: MessageContext): void {
    ctx.send('pong');
  }
}

export default new PingCommand();