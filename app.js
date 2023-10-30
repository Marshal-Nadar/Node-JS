const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
// Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const { isLoggedIn } = require('./controllers/authController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middlewares

// Serving stactic files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP Headers
app.use(helmet());

// Development logging
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body Parser, reading data from body into req.body
// When body is greater than 10KB, it won't accept
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Enable CORS for all routes
const corsOptions = {
  // set origin to a specific origin.
  origin: 'http://localhost:3001',

  // or, set origin to true to reflect the request origin
  //origin: true,

  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
    ],
  })
);

// app.use((req, res, next) => {
//   console.log('Hello from middleware');
//   next();
// });

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // To Test Global ERROR
  // console.log(x);
  console.log('req.cookies', req.cookies);
  next();
});

// 3) Routes

// app.get('/api/v1/tours', getAllTour);
// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// Test Middleware
// app.use('/', (req, res,) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//   });
// });

app.use(isLoggedIn);

app.use('/api/v1/tours', tourRouter);
// app.use((req, res, next) => {
//   console.log('Log the populated tour object', req.tour); // Log the populated tour object
//   next();
// });

app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Failed',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this serverrr`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this serverrr`, 404));
});

app.use(globalErrorHandler);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// app.use(globalErrorHandler);

module.exports = app;
