import fetch from 'node-fetch';
import cheerio from 'cheerio';
import sharp, { Region } from 'sharp';

export class TimetableRetriever {
  private readonly HTML_IMG_SELECTOR = '.page_raspis_block_img img';
  private readonly LEFT_OFFSET = 672;
  private readonly REGION_WIDTH = 116;
  private readonly REGION_HEIGHT = 161;
  
  public async getTimetableRegion(): Promise<Buffer> {
    const fullTimetable = await this.getTimetablesImage();
    return this.extractAndResizeRegionFromImage(fullTimetable);
  }
  
  private async extractAndResizeRegionFromImage(img: Buffer): Promise<Buffer> {
    const sharpImg = sharp(img);

    const metadata = await sharpImg.metadata();
    if (!metadata.height || !metadata.width)
      throw new Error('Failed to receive image size from metadata');
    
    return sharpImg
      .extract(this.getRegionExtractOptions(metadata.height))
      .resize(this.REGION_WIDTH * 2, this.REGION_HEIGHT * 2) // Resize x2
      .toBuffer();
  }
  
  private getRegionExtractOptions(imgHeight: number): Region {
    return {
      left: this.LEFT_OFFSET,
      top: imgHeight - this.REGION_HEIGHT,
      width: this.REGION_WIDTH,
      height: this.REGION_HEIGHT,
    };
  }
  
  private async getTimetablesImage(): Promise<Buffer> {
    const imageURL = await this.getTimetablesURL();
    return fetch(imageURL)
      .then(res => res.buffer());
  }
  
  private async getTimetablesURL(): Promise<string> {
    const pageHTML = await this.getPageHTML();
    return this.extractImageURLfromHTML(pageHTML);
  }
  
  private extractImageURLfromHTML(html: string): string {
    const $ = cheerio.load(html);
    const imageURL = $(this.HTML_IMG_SELECTOR).attr('src');
    if (!imageURL)
      throw new Error('Image url not in html');
    
    return imageURL;
  }
  
  private getPageHTML(): Promise<string> {
    if (!process.env.TIMETABLE_PAGE_URL)
      throw new Error('Environment variable "TIMETABLE_PAGE_URL" is not defined');

    return fetch(process.env.TIMETABLE_PAGE_URL)
      .then(res => res.text());
  }
}