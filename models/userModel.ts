import { Schema, model } from "mongoose";
import { UserModel, UserModelType } from "../types/models";
import bcrypt from "bcrypt";

const userSchema = new Schema<UserModelType>(
  {
    firstName: { type: String, lowercase: true },
    lastName: { type: String, lowercase: true },
    userName: { type: String, lowercase: true, unique: true },
    email: {
      type: String,
      lowercase: true,
      unique: true,
    },
    dateOfBirth: { type: Date },
    placeOfBirth: { type: String },
    phoneNumber: {
      type: String,
      lowercase: true,
      unique: true,
    },
    password: { type: String, minLength: [8, "Minimum Password length is 8"] },
    transactionPin: {
      type: String,
    },
    hasSetTransactionPin: { type: Boolean, default: false, required: true },
    loginPin: {
      type: String,
    },
    hasSetLoginPin: { type: Boolean, default: false, required: true },
    customerID: String,
    account: {
      id: String,
      bankName: String,
      accountNumber: String,
    },
    address: {
      fullAddress: { type: String },
      street: { type: String, lowercase: true },
      city: { type: String, lowercase: true },
      state: { type: String, lowercase: true },
      lga: { type: String, lowercase: true },
      country: { type: String, lowercase: true },
    },
    accountType: {
      type: String,
      lowercase: true,
      enum: ["personal", "business", "admin"],
    },
    businessName: String,
    businessType: {
      type: String,
      // enum: ["sole_proprietorship", "ltd", "llc", "ngo", "charity/religion"],
    },
    verificationLevel: {
      type: Number,
      enum: [0, 1, 2, 3],
    },
    hasVerifiedEmail: Boolean,
    bvn: {
      type: String,
    },
    gender: String,
    nextOfKin: {
      name: String,
      address: String,
      phoneNumber: String,
      relationship: String,
    },
    director: {
      name: String,
      address: String,
      phoneNumber: String,
      role: String,
    },
    hasOnboarded: Boolean,
    hasCompletedRegistration: Boolean,
    plan: { type: String, lowercase: true },
    NIN: String,
    cacNo: String,
    userRole: {
      type: String,
      enum: ["customer", "editor", "manager", "admin"],
      required: [true, "User Role not set"],
    },
    profilePicture: {
      fileId: String,
      filename: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
    meansOfID: {
      type: String,
      lowercase: true,
      enum: [
        "drivers license",
        "voters card",
        "international passport",
        "national id card",
        "nin slip",
      ],
    },
    cacDoc: {
      fileId: String,
      filename: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
    internationalPassport: {
      fileId: String,
      filename: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
    PVC: {
      fileId: String,
      filename: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
    driversLicense: {
      fileId: String,
      filename: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
    votersCard: {
      fileId: String,
      filename: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
    NINSlip: {
      fileId: String,
      name: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
    nationalIDCard: {
      fileId: String,
      name: String,
      url: String,
      thumbnailUrl: String,
      fileType: String,
    },
  },
  { timestamps: true }
);

//Fire a function before a user is saved to the database
// Hashing the password
userSchema.pre("save", function (next) {
  if (this.password) {
    bcrypt
      .genSalt()
      .then((salt) => {
        bcrypt
          .hash(this.password as string, salt)
          .then((hash) => {
            this.password = hash;
            next();
          })
          .catch(next);
      })
      .catch(next);
  }
});

// Hashing the transaction pin
userSchema.pre("save", function (next) {
  if (this.transactionPin) {
    bcrypt
      .genSalt()
      .then((salt) => {
        bcrypt
          .hash(this.transactionPin as string, salt)
          .then((hash) => {
            this.transactionPin = hash;
            next();
          })
          .catch(next);
      })
      .catch(next);
  } else {
    next();
  }
});
// Hashing the login pin
userSchema.pre("save", function (next) {
  if (this.loginPin) {
    bcrypt
      .genSalt()
      .then((salt) => {
        bcrypt
          .hash(this.loginPin as string, salt)
          .then((hash) => {
            this.loginPin = hash;
            next();
          })
          .catch(next);
      })
      .catch(next);
  } else {
    next();
  }
});

//Fire a function after a user has been saved to the database
//Function to login user
userSchema.statics.loginWithEmail = async function ({ email, password }) {
  const user = await this.findOne({ email });
  if (user) {
    console.log(password);
    const auth = await bcrypt.compare(password, user.password);
    console.log({ auth });
    if (auth) {
      return user;
    }
    throw Error("Incorrect Password");
  }
  throw Error("Incorrect Email");
};

//Function to login user with login pin
userSchema.statics.loginWithPinAndEmail = async function ({ email, loginPin }) {
  const user = await this.findOne({ email });
  console.log(user);
  if (user) {
    if (!user.loginPin) {
      throw Error("You haven't set your login pin. Please do that first.");
    }
    const auth = await bcrypt.compare(loginPin, user.loginPin);

    if (auth) {
      return user;
    }
    throw Error("Incorrect Login Pin Sent");
  }
  throw Error("Incorrect Email");
};

userSchema.statics.loginWithPinAndPhone = async function ({
  phoneNumber,
  loginPin,
}) {
  const user = await this.findOne({ phoneNumber });
  if (user) {
    if (!user.loginPin) {
      throw Error("You haven't set your login pin. Please do that first.");
    }
    const auth = await bcrypt.compare(loginPin, user.loginPin);
    if (auth) {
      return user;
    }
    throw Error("Incorrect Login Pin Sent");
  }
  throw Error("Incorrect Phone Number");
};

//Function to validate user's pin
userSchema.statics.validateTransactionPinWithEmail = async function ({
  email,
  transactionPin,
}) {
  const user = await this.findOne({ email });
  if (user) {
    console.log({ user });
    if (!user.transactionPin) {
      return "Pin not found";
    }
    const auth = await bcrypt.compare(transactionPin, user.transactionPin);
    console.log({ auth });
    if (auth) {
      return user;
    }
    throw Error("Incorrect Transaction Pin Sent");
  }
  throw Error("Incorrect Email");
};

userSchema.statics.validateTransactionPinWithPhone = async function ({
  phoneNumber,
  pin,
}) {
  const user = await this.findOne({ phoneNumber });
  if (user) {
    if (!user.transactionPin) {
      return "Pin not found";
    }
    const auth = await bcrypt.compare(pin, user.transactionPin);
    if (auth) {
      return user;
    }
    throw Error("Incorrect Transaction Pin Sent");
  }
  throw Error("Incorrect Phone Number");
};

const User = model<UserModelType>("User", userSchema) as UserModel;
export default User;
