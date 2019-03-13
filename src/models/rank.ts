import { model, Schema } from 'mongoose';

import { Rank } from '../interfaces/rank';

const RankSchema = new Schema({
  name: String,
  exp: Number,
});

export const RankModel = model<Rank>('Rank', RankSchema);
