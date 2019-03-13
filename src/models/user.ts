import { model, Schema } from 'mongoose';

const UserSchema = new Schema({
  id: Number,
  firstName: String,
  lastName: String,
  exp: {
    type: Number,
    default: 0,
  },
});

export const UserModel = model('User', UserSchema);
