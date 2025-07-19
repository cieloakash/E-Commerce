import User from "../models/user.model.js";
import { genToken } from "../utils/genToken.js";
import bcrypt from "bcryptjs";
import { otpService } from "../utils/sendOtp.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = genToken(user._id);

    return res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "email already exist" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = genToken(newUser._id);
    await sendOtp(
      { body: { email: newUser.email } }, // mock req
      { 
        json: (data) => console.log('OTP sent:', data) // mock res
      }
    );
    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent for verification.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const checkedMail = await User.findOne({ email });
    if (!checkedMail) {
      return res.status(404).json({
        success: false,
        message: "Email not found ",
      });
    }
    const result = await otpService.sendOtp(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  let { email = "", otp = "" } = req.body;
  email = email.toString().toLowerCase().trim();
  otp = otp.toString().trim();
  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not registered",
      });
    }
    const result = await otpService.verifyOtpService(email, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      message: "otp veerified sucessfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};
