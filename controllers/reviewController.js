const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');

const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

const createReview = catchAsync(async (req, res, next) => {
  const newReviews = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    review: newReviews,
  });
});

module.exports = { createReview, getAllReviews };
