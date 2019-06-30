import { MessageContext } from 'vk-io';

export interface Command {
  conditions: string[];
  handler: (context: MessageContext) => void | Promise<void>;
}
