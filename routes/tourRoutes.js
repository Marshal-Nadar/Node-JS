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
} = require('../controllers/tourController');

// router.param('id', CheckID);

router.route('/').get(getAllTour).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
