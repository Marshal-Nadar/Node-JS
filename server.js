const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Shutting Down!');
  // console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

// console.log(process.env);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {

  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then((con) => {
    // console.log('connection result', con);
    console.log('Connection Successful!');
  });

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error 💣:', err);
//   });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App listening on PORT ${port} `);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting Down!');
  // console.log(err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
