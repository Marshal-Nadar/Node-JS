const express = require('express');

const router = express.Router();

const {
  getAllTour,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  // CheckID,
  // checkBody,
  aliasTopTour,
  getTourStatus,
  getMonthlyPlan,
} = require('../controllers/tourController');

// const { createReview } = require('../controllers/reviewController');

// POST /tours/5c88fa8cf4afda39709c2951/reviews
// GET /tours/5c88fa8cf4afda39709c2951/reviews

const reviewRouter = require('../routes/reviewRoutes');

const { protect, restrictTo } = require('./../controllers/authController');

// router.param('id', CheckID);

router.use('/:tourId/reviews', reviewRouter);

// Alias Route
router.route('/top-5-cheap').get(aliasTopTour, getAllTour);

router.route('/tour-stats').get(getTourStatus);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide'), getMonthlyPlan);

router
  .route('/')
  .get(getAllTour)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

module.exports = router;
