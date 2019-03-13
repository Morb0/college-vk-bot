import { model, Schema } from 'mongoose';

import { User } from '../interfaces/user';

const UserSchema = new Schema({
  id: Number,
  firstName: String,
  lastName: String,
  exp: {
    type: Number,
    default: 0,
  },
});

export const UserModel = model<User>('User', UserSchema);
