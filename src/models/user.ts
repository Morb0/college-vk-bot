import { model, Schema } from 'mongoose';

const UserSchema = new Schema({
  peerId: Number,
  exp: {
    type: Number,
    default: 0,
  },
});

export default model('User', UserSchema);
