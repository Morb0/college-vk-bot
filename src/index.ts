import dotenv from 'dotenv';
import { Bootstrap } from './classes/bootstrap';

dotenv.config();

const bot = new Bootstrap();
bot.boot();