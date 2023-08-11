const fs = require('fs');

const Tour = require('../models/tourModel');

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

const getAllTour = async (req, res) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // console.log(req.query);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr), 'fgdf', req.query.sort);

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    }

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }

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
};

const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
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
};

const createTour = async (req, res) => {
  try {
    console.log(req.body);

    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }

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
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

module.exports = {
  getAllTour,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  // CheckID,
  // checkBody,
};
