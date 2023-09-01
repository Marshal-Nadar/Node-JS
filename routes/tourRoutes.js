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

const { protect, restrictTo } = require('./../controllers/authController');

// router.param('id', CheckID);

// Alias Route
router.route('/top-5-cheap').get(aliasTopTour, getAllTour);

router.route('/tour-stats').get(getTourStatus);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getAllTour).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
