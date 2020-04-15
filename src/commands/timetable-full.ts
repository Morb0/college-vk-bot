import { Command, CommandHelpCategory } from '../core/command/command';
import { MessageContext } from 'vk-io';
import { TimetableRetriever } from '../utils/timetable-retriever';

class TimetableFullCommand extends Command {
  private readonly timetableRetriever: TimetableRetriever;

  constructor() {
    super('timetable-full', ['ttf', 'timetable-full'], CommandHelpCategory.Timetable, 'Актуальное полное расписание');
    this.timetableRetriever = new TimetableRetriever();
  }

  async execute(ctx: MessageContext): Promise<void> {
    const timetableImg = await this.timetableRetriever.getTimetableImage();
    const attachment = await ctx.vk.upload.messagePhoto({
      source: timetableImg,
    });
    await ctx.send({
      attachment,
    });
  }
}

export default new TimetableFullCommand();