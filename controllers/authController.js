const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// only gmail supports
const gmailOnly = (email) => email?.toLowerCase().endsWith("@gmail.com");

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (!gmailOnly(email))
      return res.status(400).json({ message: "Only Gmail accounts are supported" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password too short (min 6 chars)" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    if (!gmailOnly(email))
      return res.status(400).json({ message: "Only Gmail accounts are supported" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Wrong email or password" });

    const token = generateToken(user._id);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login };
