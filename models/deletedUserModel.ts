import { Schema, model } from "mongoose";
import { DeletedUserModelType } from "../types/models";

const deletedUserSchema = new Schema<DeletedUserModelType>(
  {
    firstName: { type: String, lowercase: true },
    lastName: { type: String, lowercase: true },
    email: {
      type: String,
      lowercase: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const User = model<DeletedUserModelType>("DeletedUser", deletedUserSchema);
export default User;
