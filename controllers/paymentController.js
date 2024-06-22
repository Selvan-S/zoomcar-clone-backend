const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const ErrorResponse = require("../utils/errorResponse");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const storeItems = new Map([
  [
    "666942b567f94c8ecab2f4b0",
    {
      pricePerHour: 110,
      name: "Maruti Suzuki Ignis",
      hostCarImage: [
        "https://imgur.com/9yZ35Q6.png",
        "https://imgur.com/uSUixjN.png",
        "https://i.imgur.com/8CFgPGn.png",
        "https://i.imgur.com/JQcl42d.png",
        "https://i.imgur.com/wWLlnDP.png",
      ],
    },
  ],
  [
    "666944d467f94c8ecab2f4b3",
    {
      pricePerHour: 163,
      name: "Ford Aspire",
      hostCarImage: [
        "https://i.imgur.com/beDdO6y.png",
        "https://imgur.com/EN39eC0.png",
        "https://imgur.com/y7xW1iB.png",
        "https://imgur.com/rF0xdOU.png",
        "https://imgur.com/nCRaTQi.png",
      ],
    },
  ],
  [
    "6669469167f94c8ecab2f4b6",
    {
      pricePerHour: 195,
      name: "Maruti Suzuki BALENO",
      hostCarImage: [
        "https://i.imgur.com/X16Ktiw.png",
        "https://i.imgur.com/8h9wR0m.png",
        "https://i.imgur.com/2JaQLVs.png",
        "https://i.imgur.com/yPFuUB9.png",
      ],
    },
  ],
  [
    "66694b9967f94c8ecab2f4b9",
    {
      pricePerHour: 138,
      name: "Maruti Suzuki Swift",
      hostCarImage: [
        "https://i.imgur.com/XvS5yI3.png",
        "https://i.imgur.com/Wthas87.png",
        "https://i.imgur.com/D9BPkYY.png",
        "https://i.imgur.com/kBOVxrc.png",
      ],
    },
  ],
  [
    "66695e1dd34c708b97deed68",
    {
      pricePerHour: 100,
      name: "Datsun Go",
      hostCarImage: [
        "https://i.imgur.com/CUK17F1.jpeg",
        "https://i.imgur.com/kL27VOH.jpeg",
        "https://i.imgur.com/xL76wgh.jpeg",
        "https://i.imgur.com/glVQrLu.jpeg",
      ],
    },
  ],
  [
    "666962d1d34c708b97deed6b",
    {
      pricePerHour: 457,
      name: "Hyundai Creta",
      hostCarImage: [
        "https://i.imgur.com/HYVQIeW.png",
        "https://i.imgur.com/FeHEAqM.png",
        "https://i.imgur.com/s92xCuf.png",
      ],
    },
  ],
  [
    "66696487d34c708b97deed6e",
    {
      pricePerHour: 555,
      name: "KIA Carens",
      hostCarImage: [
        "https://i.imgur.com/jOYj64q.png",
        "https://i.imgur.com/s5CVObd.png",
        "https://i.imgur.com/wFAexOI.png",
      ],
    },
  ],
  [
    "666d86f61d70c2e2b05b306d",
    { pricePerHour: 1, name: "testing", hostCarImage: [] },
  ],
]);
const createPayment = async (req, res, next) => {
  const vehicleId = req.params.id;
  const { startDate, endDate, startTime, endTime, tripProtectionFee } =
    req.body;
  console.log(startDate, endDate, startTime, endTime, tripProtectionFee);
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.availability) {
      return next(new ErrorResponse("Vehicle not available", 400));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const vehicle = storeItems.get(item.id);
        return {
          price_data: {
            currency: "INR",
            product_data: {
              name: vehicle.name,
              images: vehicle.hostCarImage,
            },
            unit_amount: Math.round(item.totalPrice * 100),
          },
          quantity: 1,
        };
      }),
      success_url: `${process.env.CLIENT_URL}`,
      cancel_url: `${process.env.CLIENT_URL}/vehicle/details/${vehicleId}`,
    });

    const booking = new Booking({
      vehicle: vehicleId,
      user: req.user._id,
      startDate,
      endDate,
      startTime,
      endTime,
      tripProtectionFee,
      totalPrice: req.body.items[0].totalPrice,
    });

    await booking.save();

    // Update vehicle availability
    vehicle.availability = false;
    await vehicle.save();

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createPayment };
