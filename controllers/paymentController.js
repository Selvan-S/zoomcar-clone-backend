const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const ErrorResponse = require("../utils/errorResponse");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create Stripe Payment
const createPayment = async (req, res, next) => {
  const vehicleId = req.params.id;
  const { startDate, endDate, startTime, endTime, tripProtectionFee } =
    req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.availability) {
      return next(new ErrorResponse("Vehicle not available", 400));
    }

    const booking = new Booking({
      vehicle: vehicleId,
      user: req.user._id,
      startDate,
      endDate,
      startTime,
      endTime,
      tripProtectionFee,
      totalPrice: req.body.items[0].totalPrice,
      paymentStatus: "pending", // Set status to pending initially
    });

    // Creates a payment session for which the product data and total price we provided
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        return {
          price_data: {
            currency: "INR",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.totalPrice * 100),
          },
          quantity: 1,
        };
      }),
      // On success, redirect to user bookings page
      success_url: `${process.env.CLIENT_URL}/user/bookings`,
      // On cancel, redirect to vehicle details,
      // in which the vehicle where user tried to make payment
      cancel_url: `${process.env.CLIENT_URL}/vehicle/details/${vehicleId}`,
      metadata: { bookingId: booking._id.toString() }, // Pass the booking ID to Stripe session
    });

    await booking.save();

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createPayment };
