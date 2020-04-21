import fetch from 'node-fetch';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';

export class DistanceTimetableRetriever {
  private readonly pageUrl: string;
  private readonly htmlUrlSelector: string;
  private readonly columnsOffset: number;
  private readonly rowsOffset: number;
  
  constructor() {
    this.pageUrl = process.env.DIST_TIMETABLE_PAGE_URL!;
    this.htmlUrlSelector = process.env.DIST_TIMETABLE_HTML_URL_SELECTOR!;
    this.columnsOffset = +process.env.DIST_TIMETABLE_COLUMNS_OFFSET!;
    this.rowsOffset = +process.env.DIST_TIMETABLE_ROWS_OFFSET!;
  }

  public async getSchedule(): Promise<string[]> {
    const documentURL = await this.getDocumentURL();
    const documentContent = await this.getDocumentContent(documentURL);
    const rawTimetable = this.extractScheduleFromDocumentByOffset(documentContent);
    return rawTimetable.map(lessonInfo => DistanceTimetableRetriever.prettifyLessonInfo(lessonInfo));
  }

  private async getDocumentURL(): Promise<string> {
    const pageHTML = await this.getPageHTML();
    return this.extractDocumentURLFromHTML(pageHTML);
  }
  
  private extractDocumentURLFromHTML(html: string): string {
    const $ = cheerio.load(html);
    const documentURL = $(this.htmlUrlSelector).find('a').first().attr('href');
    if (!documentURL)
      throw new Error('Document url not in html');

    return documentURL;
  }

  private getPageHTML(): Promise<string> {
    return fetch(this.pageUrl)
      .then(res => res.text());
  }

  private getDocumentContent(url: string): Promise<string> {
    return fetch(url)
      .then(res => res.buffer())
      .then(buff => iconv.decode(buff, 'win1251'))
  }
  
  private extractScheduleFromDocumentByOffset(content: string): string[] {
    const $ = cheerio.load(content);
    const $rows = $('tbody tr');
    const curDayOfWeek = this.getMoscowWeekday()-1; // TEMP. Actually timetable starts from Tuesday
    const schedule = [];
    
    for (let i = 0; i < 5; i++) {
      const rowOffsetWithWeekday = this.rowsOffset*curDayOfWeek;
      const rowOffsetWithLesson = rowOffsetWithWeekday+i;
      let columnIndex = this.columnsOffset;
      
      if (i === 0) // Skip first date row
        columnIndex++;
      
      const $cell = $rows.eq(rowOffsetWithLesson).find('td').eq(columnIndex);
      const lessonInfo = $cell.text();
      schedule.push(lessonInfo);
    }
    
    return schedule;
  }
  
  private getMoscowWeekday() {
    const dayOfWeek = new Date(new Date().toLocaleString('en-US', {timeZone: 'Europe/Moscow'})).getDay();
    if (dayOfWeek > 5) return 1;
    return dayOfWeek;
  }
  
  private static prettifyLessonInfo(lessonInfo: string): string {
    const parts = lessonInfo.split('\n').map(str => str.trim());
    const teacher = parts.pop();
    const lessonName = parts.join(' ');
    return `➡ ${lessonName} [${teacher}]`;
  }
}