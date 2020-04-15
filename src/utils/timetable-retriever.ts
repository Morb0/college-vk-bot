import fetch from 'node-fetch';
import cheerio from 'cheerio';
import sharp, { Region } from 'sharp';

export class TimetableRetriever {
  private readonly pageUrl: string;
  private readonly htmlImgSelector: string;
  private readonly leftOffset: number;
  private readonly regionWidth: number;
  private readonly regionHeight: number;
  
  constructor() {
    this.pageUrl = process.env.TIMETABLE_PAGE_URL!;
    this.htmlImgSelector = process.env.TIMETABLE_HTML_IMG_SELECTOR!;
    this.leftOffset = +process.env.TIMETABLE_LEFT_OFFSET!;
    this.regionWidth = +process.env.TIMETABLE_REGION_WIDTH!;
    this.regionHeight = +process.env.TIMETABLE_REGION_HEIGHT!;
  }
  
  public async getTimetableRegion(): Promise<Buffer> {
    const fullTimetable = await this.getTimetableImage();
    return this.extractAndResizeRegionFromImage(fullTimetable);
  }
  
  private async extractAndResizeRegionFromImage(img: Buffer): Promise<Buffer> {
    const sharpImg = sharp(img);

    const metadata = await sharpImg.metadata();
    if (!metadata.height || !metadata.width)
      throw new Error('Failed to receive image size from metadata');
    
    return sharpImg
      .extract(this.getRegionExtractOptions(metadata.height))
      .resize(this.regionWidth * 2, this.regionHeight * 2) // Resize x2
      .toBuffer();
  }
  
  private getRegionExtractOptions(imgHeight: number): Region {
    return {
      left: this.leftOffset,
      top: imgHeight - this.regionHeight,
      width: this.regionWidth,
      height: this.regionHeight,
    };
  }
  
  public async getTimetableImage(): Promise<Buffer> {
    const imageURL = await this.getTimetableURL();
    return fetch(imageURL)
      .then(res => res.buffer());
  }
  
  private async getTimetableURL(): Promise<string> {
    const pageHTML = await this.getPageHTML();
    return this.extractImageURLfromHTML(pageHTML);
  }
  
  private extractImageURLfromHTML(html: string): string {
    const $ = cheerio.load(html);
    const imageURL = $(this.htmlImgSelector).attr('src');
    if (!imageURL)
      throw new Error('Image url not in html');
    
    return imageURL;
  }
  
  private getPageHTML(): Promise<string> {
    return fetch(this.pageUrl)
      .then(res => res.text());
  }
}