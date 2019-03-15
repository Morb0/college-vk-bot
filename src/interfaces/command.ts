import VK, { MessageContext } from 'vk-io';

export interface Command {
  name: string;
  conditions: string[];
  handler: (context: MessageContext, vk: VK) => void;
}
