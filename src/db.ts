import { connect } from 'mongoose';

connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
  },
)
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(err => {
    throw err;
  });
