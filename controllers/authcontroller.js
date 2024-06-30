const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const VerifyUser = require("../models/VerifyUser");
const { sendMail } = require("./SendMail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password required" });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const checkUserUnderVerification = await VerifyUser.findOne({ email });
    if (checkUserUnderVerification) {
      return res
        .status(400)
        .json({ error: "Already the verification link is sent to the eamil" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = generateToken(email);
    const newUser = new VerifyUser({
      name: name,
      email: email,
      password: hashedPassword,
      token: token,
    });

    const activationLink = `https://zoomcar-clone-backend.onrender.com/api/v1/auth/${token}`;
    const content = `<h4> Hi, there </h4>
      <h5>Welcome to the Zoomcar clone</h5>
      <p>Thank you for Sign up. Click on the below link to activate</p>
      <a href=${activationLink}>Click Here</a>
      <p>Regards</p>
      <p>Team</p>`;
    // Send activation link mail
    sendMail(email, "Zoomcar Clone - Account Activation Link", content);
    // Save user under verify user
    await newUser.save();
    res.status(200).json({ msg: "Activation link is sent to your email." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const InsertSignUpUser = async (req, res) => {
  try {
    const userVerify = await VerifyUser.findOne({ token: req.params.token });
    // If user is user with token valid
    if (userVerify) {
      const newUser = new User({
        name: userVerify.name,
        email: userVerify.email,
        password: userVerify.password,
      });
      await userVerify.deleteOne({ token: req.params.token });
      const loginPage = "https://zoomcar-clone-selvan.netlify.app/login";
      const content = `<h4> Registration successful</h4>
      <h5>Welcome to the Zoomcar Clone</h5>
      <p>You are successfully registered</p>
      <a href=${loginPage}>Please login</a>
      <p>Regards</p>
      <p>Team</p>`;
      // Send Registration successful
      sendMail(
        newUser.email,
        "Zoomcar clone - Registration successful",
        content
      );
      await newUser.save();
      return res.status(200).send(`<h3> Hi ${newUser.name}, </h3>
      <p>You are successfully registered</p>
      <p>Please login</p>
      <p>Regards</p>
      <p>Team</p>`);
    }
    // Else, the token is expired
    return res.status(404).send(`<h4> Registration failed</h4>
      <p>Link expired...</p>
      <p>Regards</p>
      <p>Team</p>`);
  } catch (error) {
    console.log("Error in insert signup user: " + error);
    res.status(500).send(`
      <html>
        <body>
          <h4> Registration failed</h4>
          <p>Unexpected error happened</p>
          <p>Regards</p>
          <p>Team</p>
        </body>
      </html>`);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userAvatarLink: user.userAvatarLink,
          token: generateToken(user.id),
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  generateToken,
  InsertSignUpUser,
};
