import * as rp from 'request-promise';

// NOTE: https://habr.com/ru/post/139931/
let bpcToken: string;
const loadBPCToken = async () => {
  const body = await rp.get('http://simfpolyteh.ru', {
    timeout: 5000,
  });

  const token = body.match(/bpc=([^<]+);Path/)[1];
  if (!token) {
    throw new Error('Error receiving bpc cookie value');
  }
  console.log(`Success received bpc cookie: ${token}`);
  bpcToken = token;
};

export const getBPCToken = async (): Promise<string> => {
  if (bpcToken) {
    return bpcToken;
  }

  await loadBPCToken();
  return bpcToken;
};
