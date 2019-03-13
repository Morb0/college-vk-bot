import { Document } from 'mongoose';

export interface User extends Document {
  id: number;
  firstName: string;
  lastName: string;
  exp: number;
}
