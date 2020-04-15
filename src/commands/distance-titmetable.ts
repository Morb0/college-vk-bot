import { Command, CommandHelpCategory } from '../core/command/command';
import { MessageContext } from 'vk-io';
import { DistanceTimetableRetriever } from '../utils/distance-timetable-retriever';

class TimetableCommand extends Command {
  private readonly timetableRetriever: DistanceTimetableRetriever;

  constructor() {
    super('distance-timetable', ['dtt', 'dist-timetable'], CommandHelpCategory.Timetable, 'Актуальное расписание группы');
    this.timetableRetriever = new DistanceTimetableRetriever();
  }

  async execute(ctx: MessageContext): Promise<void> {
    const schedule = await this.timetableRetriever.getSchedule();
    const scheduleMsg = schedule.join('\n');
    await ctx.send(scheduleMsg);
  }
}

export default new TimetableCommand();