import { Command, CommandHelpCategory } from '../core/command/command';
import { MessageContext } from 'vk-io';
import { TimetableRetriever } from '../utils/timetable-retriever';

class TimetableCommand extends Command {
  private readonly timetableRetriever: TimetableRetriever;

  constructor() {
    super('timetable', ['tt', 'timetable'], CommandHelpCategory.Timetable, 'Актуальное расписание группы');
    this.timetableRetriever = new TimetableRetriever();
  }

  async execute(ctx: MessageContext): Promise<void> {
    const timetableImg = await this.timetableRetriever.getTimetableRegion();
    const attachment = await ctx.vk.upload.messagePhoto({
      source: timetableImg,
    });
    await ctx.send({
      attachment,
    });
  }
}

export default new TimetableCommand();