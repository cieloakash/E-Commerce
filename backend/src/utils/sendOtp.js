import { createTransport } from "nodemailer";
import { Otp } from "../models/otp.model.js";

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASS,
  },
});

export const otpService = {
  sendOtp: async (email) => {
    try {
      await Otp.deleteMany({ email });
      const createdOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await Otp.create({
        email,
        otp: createdOtp,
        attempts: 0,
      });

      const mailSendDetail = {
        from: '"cielo"', // Sender address
        to: email,
        subject: "Your OTP Verification Code",
        text: `Your OTP code is ${createdOtp}. It expires in 5 minutes.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Verification Code</h2>
          <p style="font-size: 18px; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 3px;">${createdOtp}</strong>
          </p>
          <p style="color: #666;">
            This code will expire in 5 minutes. Please don't share it with anyone.
          </p>
        </div>
      `,
      };

      const info = await transport.sendMail(mailSendDetail);
      return {
        sucess: true,
        message: "Otp sent successfully",
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      };
    }
  },

  verifyOtpService: async (email, userEnteredOtp) => {
    try {
      const otpString = userEnteredOtp.toString();
      const otpRecord = await Otp.findOne({ email });
      if (!otpRecord) {
        return {
          success: false,
          message: "otp is required",
        };
      }
      if (otpRecord.attempts >= 3) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return {
          success: false,
          message: "Maximum attempts reached. Please request a new OTP.",
          isExpired: true,
        };
      }
      if (otpString != otpRecord.otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        const remainingAttemps = 3 - otpRecord.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttemps} attempt(s) remaining.`,
          attemptsRemaining,
        };
      }
      await Otp.deleteOne({ _id: otpRecord._id });
      return { success: true, message: "otp verified" };
    } catch (error) {
      return {
        success: false,
        message: "Error verifying OTP",
        error: error.message,
      };
    }
  },
};
