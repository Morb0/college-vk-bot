import fetch from 'node-fetch';
import cheerio from 'cheerio';
import sharp, { Region } from 'sharp';
import { timeTableConfig } from '../configs/timetable.config';

export class TimetableRetriever {
  private readonly pageUrl: string;
  private readonly htmlImgSelector: string;
  private readonly leftOffset: number;
  private readonly regionWidth: number;
  private readonly regionHeight: number;
  
  constructor() {
    this.pageUrl = timeTableConfig.pageURL;
    this.htmlImgSelector = timeTableConfig.htmlImgSelector;
    this.leftOffset = timeTableConfig.leftOffset;
    this.regionWidth = timeTableConfig.regionWidth;
    this.regionHeight = timeTableConfig.regionHeight;
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