import { connect } from 'mongoose';

connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true },
  err => {
    if (err) {
      throw err;
    }

    console.log('Success connected to db');
  },
);
