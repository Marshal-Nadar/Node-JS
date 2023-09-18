// const fs = require('fs');

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// const CheckID = (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);
//   if (+req.params.id > tours.length) {
//     return res.status(404).json({
//       status: 'Failed',
//       message: 'Invalid IDs',
//     });
//   }
//   next();
// };

// const checkBody = (req, res, next) => {
//   console.log('checkBody');
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'Failed',
//       message: 'Missing req.Name & req.Price',
//     });
//   }
//   next();
// };

const aliasTopTour = (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = '-ratingsAverage,price'),
    (req.query.fields = 'name,price,ratingsAverage,summary,difficulty');
  next();
};

const getAllTour = catchAsync(async (req, res, next) => {
  // try {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Failed',
  //     message: err,
  //   });
  // }

  // const query = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  // console.log('req.requestTime', req);
  // res.status(200).json({
  //   status: 'success',
  //   requestedAt: req.requestTime,
  //   result: tours.length,
  //   data: {
  //     tours,
  //   },
  // });
});

const getTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  // console.log('sbdfvbsjvbs', tour);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  // } catch (err) {
  //   if (err.name === 'CastError') {
  //     return res.status(408).json({
  //       status: 'Failed',
  //       message: `Invalid ${err.path}: ${err.value}.`,
  //     });
  //   }
  //   res.status(404).json({
  //     status: 'Failed',
  //     message: err,
  //   });
  // }

  // console.log(req.params);
  // const id = req.params.id * 1;

  // const tour = tours.find((el) => el.id === id);
  // // console.log('tour', tour);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
});

const createTour = catchAsync(async (req, res, next) => {
  // console.log(req.body);

  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: { tour: newTour } });

  // res.status(400).json({
  //   status: 'Fail',
  //   message: err,
  // });

  // if (!req.body.name || !req.body.price) {
  //   return res.status(404).json({
  //     status: 'Failed',
  //     message: 'Missing not present',
  //   });
  // }

  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // // const newTour = { newId, ...res.body };

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json}`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({ status: 'success', data: { tour: newTour } });
  //   }
  // );
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

const getTourStatus = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
    {
      $limit: 14, // No result, cause there are no more 14 no of data
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});

module.exports = {
  getAllTour,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStatus,
  getMonthlyPlan,
  // CheckID,
  // checkBody,
};
