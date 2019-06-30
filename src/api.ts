import './utils/anti-sleep';

import { Request, Response } from 'express';
import { getCheerioContent, getCollegeRawImage } from './utils/requests';

import ms from 'ms';
import sharp from 'sharp';

const PORT = process.env.PORT || 3000;

const express = require('express');

const app = express();

const cache: {
  [key: string]: {
    time: number;
    data: any;
  };
} = {};

app.get('/api/timetable', async (_req: Request, res: Response) => {
  if (cache['timetable'] && cache['timetable'].time > Date.now()) {
    console.log('use cache');
    res.end(cache['timetable'].data, 'binary');
    delete cache['timetable'];
    return;
  }

  const $ = await getCheerioContent('http://simfpolyteh.ru/raspisanie');
  const imageUrl = $('.page_raspis_block_img')
    .find('img')
    .first()
    .attr('src');

  // Get image
  const imgBuffer = await getCollegeRawImage(imageUrl);

  // Load to sharp
  const sharpImg = sharp(imgBuffer);

  // Check image size
  const imgInfo = await sharpImg.metadata();

  // Modify image
  const modifiedImgBuffer = await sharpImg
    .extract({
      left: 0,
      top: imgInfo.height - 177, // calculated image size
      width: 129,
      height: 177,
    }) // Extract table
    .resize(258, 354) // Resize x2
    .toBuffer();

  cache['timetable'] = {
    data: modifiedImgBuffer,
    time: Date.now() + ms('1m'),
  };

  res.end(modifiedImgBuffer, 'binary');
});

app.listen(PORT, () => console.log(`listening on *:${PORT}`));
