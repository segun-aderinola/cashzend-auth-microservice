import { Schema, model } from "mongoose";
import { PassResetModelType } from "../types/models";

const Reset = new Schema<PassResetModelType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

Reset.index({ updatedAt: 1 }, { expireAfterSeconds: 900 });

const PasswordReset = model("PasswordReset", Reset);

export default PasswordReset;
