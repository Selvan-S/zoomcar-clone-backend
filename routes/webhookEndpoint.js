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
    console.log("inside webhook ", process.env.STRIPE_WEBHOOK_SECRET);
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log(event);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log(
      "done first trycatch ",
      process.env.STRIPE_WEBHOOK_SECRET,
      "event.type",
      event.type
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Retrieve the booking ID from the session metadata
      const bookingId = session.metadata.bookingId;
      console.log("done secont trycatch ", bookingId);
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
        console.log("done third trycatch ", "Last");
      } catch (err) {
        console.error("Failed to update booking or vehicle:", err);
        return res.status(500).send(`Webhook Error: ${err.message}`);
      }
    }

    res.json({ received: true });
  }
);

module.exports = webhookEndpoint;
