const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Vehicle = require("../models/Vehicle");

// Get reviews
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate("user vehicle");
    res.status(200).json(reviews);
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

// POST new reivew
const createReview = async (req, res, next) => {
  const { vehicleId, userId, BookingId, rating, comment } = req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return next(new ErrorResponse("Vehicle not found", 400));
    }
    const booking = await Booking.findById(BookingId);
    if (!booking) {
      return next(new ErrorResponse("booking not found", 400));
    }
    const review = new Review({
      vehicle: vehicleId,
      user: userId,
      rating,
      comment,
    });

    // Update review given for booking
    booking.isReviewGiven = true;
    await booking.save();

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

module.exports = { getReviews, createReview };
