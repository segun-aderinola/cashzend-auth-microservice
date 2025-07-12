import { Schema, model } from "mongoose";
import { OTPVerificationModelType } from "../types/models";

const OTPVerify = new Schema<OTPVerificationModelType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    OTP: {
      type: String,
      required: true,
    },
    verificationType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

OTPVerify.index({ updatedAt: 1 }, { expireAfterSeconds: 1800 });

const OTPVerification = model("OTPVerification", OTPVerify);

export default OTPVerification;
