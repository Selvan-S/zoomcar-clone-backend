const express = require("express");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookEndpoint = express.Router();

webhookEndpoint.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Retrieve the booking ID from the session metadata
      const bookingId = session.metadata.bookingId;

      try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
          throw new Error("Booking not found");
        }

        // Update the booking status to confirmed
        booking.paymentStatus = "confirmed";
        await booking.save();

        // Update vehicle availability
        const vehicle = await Vehicle.findById(booking.vehicle);
        if (vehicle) {
          vehicle.availability = false;
          await vehicle.save();
        }
      } catch (err) {
        console.error("Failed to update booking or vehicle:", err);
        return res.status(500).send(`Webhook Error: ${err.message}`);
      }
    }

    res.json({ received: true });
  }
);

module.exports = webhookEndpoint;
