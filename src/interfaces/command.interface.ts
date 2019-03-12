import VK, { MessageContext } from 'vk-io';

export interface Command {
  name: string;
  commands: string[];
  handler: (context: MessageContext, vk: VK) => void;
}
