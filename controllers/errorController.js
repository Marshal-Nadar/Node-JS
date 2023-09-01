const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  console.log('errerrerrerrerr', err);
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const value = err.keyValue.name;
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid token! Please login again', 401);
};
const handleJWTExpriedError = (err) => {
  return new AppError('Ypur token has expired! Please login again', 401);
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    console.log('xcvbnmnbvcxcvbnmnbv');

    // THIS IS NOT WORKIG (DEEP COPY)
    let error = { ...err };

    // DEEP COPY OF ERROR OBJECT
    let errorCopy = JSON.parse(JSON.stringify(err));

    // console.log('old error', err, err?.name, err?.name === 'CastError');

    if (errorCopy.name === 'CastError') {
      errorCopy = handleCastErrorDB(errorCopy);
    }
    if (errorCopy.code === 11000)
      errorCopy = handleDuplicateFieldsDB(errorCopy);
    if (errorCopy.name === 'ValidationError')
      errorCopy = handleValidationErrorDB(errorCopy);
    if (errorCopy.name === 'JsonWebTokenError')
      errorCopy = handleJWTError(errorCopy);
    if (errorCopy.name === 'TokenExpriedError')
      errorCopy = handleJWTExpriedError(errorCopy);

    // console.log('new error', error);

    sendErrorProd(errorCopy, res);
  }

  // next();
};
