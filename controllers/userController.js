const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
const imgur = require("imgur");

// Reads the upload paths in uploads folder (Not working in Render)
function createReadStream(uploadPath) {
  return fs.createReadStream(uploadPath);
}
// Upload file to imgur and response the file link (Not working in Render)
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
// Upload Profile Picture to imgur (Note: Avoid uploading sensitive or personal photos unless you intend for them to be shared on Imgur.)
// (Not working in Render)
// So, uploading images is handled in Frontend.
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

// Updates user details
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

// Forgot password
const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Reset url, client side password reset form route
  const resetUrl = `${process.env.CLIENT_URL}/passwordreset/${resetToken}`;

  const message = `
    <h3>You have requested a password reset</h3>
    <p>Click on the reset link, it will redirects to password reset page:</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  `;
// Sent password rest link email to the registered user
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: "Zoomcar clone - Password Reset Request",
        html: message,
      },
      (error, info) => {
        if (error) {
          console.log("Error: ", error);
          return res.status(500).json({ error: "Email could not be sent" });
        }
        console.log("Message %s sent: %s", info.messageId, info.response);
        res.status(200).json({ success: true, data: "Email sent" });
      }
    );
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(500).json({ error: "Email could not be sent" });
  }
};

// Reset password controller
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
