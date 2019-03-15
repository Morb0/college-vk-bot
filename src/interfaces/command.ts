import VK, { MessageContext } from 'vk-io';

export interface Command {
  conditions: string[];
  handler: (context: MessageContext, vk: VK) => void;
}
