// models
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
const secretKey = process.env.JWT_SECRET;

// user registration controller
const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  // regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

  try {
    // check if any field is missing
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // check if email is valid
    if (!regex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // check if the suer already exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 13);

    // create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // save new user
    const newUser = await user.save();

    // create token
    const token = jwt.sign({ id: newUser._id }, secretKey, { expiresIn: "7d" });

    res.status(200).json({
      token,
      message: "Registration successful",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
};

// user login controller
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if any field is missing
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // check if user exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // create token
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

export { register, login };
