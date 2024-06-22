const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
const imgur = require("imgur");

function createReadStream(uploadPath) {
  return fs.createReadStream(uploadPath);
}
async function imgurUplodeFile(uploadPath, res) {
  const client = new imgur.ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
  });
  const response = await client.upload({
    image: createReadStream(uploadPath),
    type: "stream",
  });
  fs.unlinkSync(uploadPath);
  res.status(200).json({ link: response.data.link });
}

const uploadImg = async (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  let userProfile = req.files.userProfile;
  let uploadPath = __dirname + "/uploads/" + userProfile.name;

  userProfile.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    imgurUplodeFile(uploadPath, res);
  });
};

const updateUserDetails = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.userAvatarLink) {
      user.userAvatarLink = req.body.userAvatarLink;
    }
    if (req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();
    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        userAvatarLink: updatedUser.userAvatarLink,
      },
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  const resetUrl = `http://localhost:${process.env.PORT}/passwordreset/${resetToken}`;

  const message = `
    <h1>You have requested a password reset</h1>
    <p>Please make a PUT request to the following link:</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(500);
    throw new Error("Email could not be sent");
  }
};

const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid token" });
  }

  if (!req.body.password) {
    res.status(404);
    return res.status(400).json({ error: "Password is required" });
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(201).json({
    success: true,
    data: "Password updated successfully",
  });
};

module.exports = {
  updateUserDetails,
  forgotPassword,
  resetPassword,
  uploadImg,
};
