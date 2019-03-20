import * as cheerio from 'cheerio';
import * as rp from 'request-promise';

import { getBPCToken } from './anti-ddos';

export const getCollegeRawImage = async (url: string) => {
  const bpcToken = await getBPCToken();
  return rp.get(url, {
    timeout: 5000,
    encoding: null,
    headers: {
      Cookie: `bpc=${bpcToken}`,
    },
  });
};

export const getRawImage = async (url: string) => {
  return rp.get(url, {
    timeout: 5000,
    encoding: null,
  });
};

export const getCheerioContent = async (url: string) => {
  const bpcToken = await getBPCToken();
  return rp.get(url, {
    timeout: 5000,
    transform: (body: string) => cheerio.load(body),
    headers: {
      Cookie: `bpc=${bpcToken}`,
    },
  });
};

export const getXHRContent = (url: string) => {
  return rp.get(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    json: true,
  });
};
