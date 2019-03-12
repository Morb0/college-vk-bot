import { model, Schema } from 'mongoose';

const RankSchema = new Schema({
  name: String,
  exp: Number,
});

export default model('Rank', RankSchema);
