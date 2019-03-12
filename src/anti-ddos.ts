import * as rp from 'request-promise';

// NOTE: https://habr.com/ru/post/139931/
export class AntiDDoS {
  private static _instance: AntiDDoS = new AntiDDoS();
  public bpcToken: string;

  public static getInstance(): AntiDDoS {
    return AntiDDoS._instance;
  }

  constructor() {
    if (AntiDDoS._instance) {
      throw new Error('Use AntiDDoS.getInstance() instead of new');
    }
    AntiDDoS._instance = this;

    this.loadBPCToken();
  }

  async loadBPCToken() {
    const body = await rp.get('http://simfpolyteh.ru', {
      timeout: 5000,
    });

    const token = body.match(/bpc=([^<]+);Path/)[1];
    if (!token) {
      throw new Error('Error receiving bpc cookie value');
    }
    console.log(`Success received bpc cookie: ${token}`);

    this.bpcToken = token;
  }
}
