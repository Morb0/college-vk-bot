import dotenv from 'dotenv';
import { Bootstrap } from './core/bootstrap';

dotenv.config();

const bot = new Bootstrap();
bot.boot();