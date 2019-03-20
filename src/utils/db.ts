import { createConnection } from 'typeorm';

if (!process.env.DATABASE_URL) {
  throw new Error('Env DATABASE_URL required');
}

export const connectDb = () =>
  createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../entity/*{.ts,.js}'],
    synchronize: true,
    ssl: true,
  });
