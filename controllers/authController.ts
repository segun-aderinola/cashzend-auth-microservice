import { Request, Response } from "express";
import { UserModelType } from "../types/models";
import { validationResult } from "express-validator";
import { createToken } from "../middlewares/tokenVerify";
import { getToken } from "../functions/token";
import { sendSMTPEmail } from "../functions/mail";
import User from "../models/userModel";
import PassReset from "../models/passResetModel";
import OTPVerification from "../models/OTPVerificationModel";
import { formatPhoneNumber, randomize } from "../utils";
import { generateFromEmail } from "../functions/generators/userName";
import BlocHQConnect from "../services/blochq";
import fs from "fs";
import {
  Tier1Request,
  Tier2Request,
  TierBasicRequest,
} from "../types/requests";

// import { authParameter } from "../middlewares/authParameter";

// Create ImageKit instance

const handleError = (err: any) => {
  console.log("Handle Error", err.message, err.code);
  // console.log(err.errors)
  const errors: any = {};

  if (err.message === "Incorrect Email") {
    errors.email = "Email is Not Registered";
  }

  if (err.message === "Incorrect Password") {
    errors.password = "The Password is Incorrect";
  }

  if (err.message.toLowerCase().includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }: any) => {
      errors[properties.path] = properties.message;
    });
  } else if (err.code === 11000 && err.keyPattern.email) {
    errors.email = "Email already exists";
  } else if (err.code === 11000 && err.keyPattern.phoneNumber) {
    errors.phoneNumber = "Phone number already exists";
  }

  return errors;
};

export const auth_signup1 = async (req: Request, res: Response) => {
  const errors = validationResult(req);
 

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid data sent.",
      error: errors.array(),
    });
  } else {
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      bvn,
      password,
      accountType,
      userRole,
    } = req.body;

    const userData: UserModelType = {
      firstName,
      lastName,
      email,
      phoneNumber: formatPhoneNumber(phoneNumber),
      bvn,
      password,
      accountType: "personal",
      userRole: userRole ? userRole : "customer",
    };
    console.log({ password });
    userData.transactionPin = "1234";
    userData.hasSetTransactionPin = false;
    userData.hasSetLoginPin = false;
    userData.userName = generateFromEmail(email, 3);
    userData.verificationLevel = 0;
    userData.customerID = "";
    userData.hasVerifiedEmail = false;
    userData.hasCompletedRegistration = false;
    if (accountType === "business") {
      userData.businessName = "";
      userData.businessType = "";
      userData.cacNo = "";
    } else {
      userData.dateOfBirth = "";
      userData.nextOfKin = {
        name: "",
        address: "",
        phoneNumber: "",
        relationship: "",
      };
    }

    const blocData = {
      email,
      phone_number: phoneNumber,
      first_name: firstName,
      last_name: lastName,
      customer_type: "personal",
      bvn,
    };
    try {
      // Create user
      const [user, blocAccount] = await Promise.all([
        User.create(userData),
        BlocHQConnect.post("/customers", blocData),
      ]);

      console.log(user);
      console.log(blocAccount?.data?.data?.id);

      // Save Customer ID
      const updatedUser = await User.findByIdAndUpdate(
        user?._id,
        { customerID: blocAccount?.data?.data?.id },
        {
          useFindAndModify: false,
          new: true,
          select: { password: 0, loginPin: 0, transactionPin: 0 },
        }
      ).exec();

      // Create token
      const token = createToken(user._id as unknown as string);

      // Split user response
      const { password, transactionPin, loginPin, bvn, ...response } =
        updatedUser!.toObject();

      // Add token to user's response
      const userResponse = { ...response, token };

      console.log(userResponse);

      // Create and send OTP to mail
      const OTP = randomize("A0", 6);

      await Promise.all([
        OTPVerification.updateOne(
          {
            user: user?._id,
          },
          {
            user: user?._id,
            OTP,
            verificationType: "email",
          },
          {
            upsert: true,
          }
        ),
        sendSMTPEmail({
          to: user?.email as string,
          subject: "Welcome to Xedla - OTP Verification",
          text: `
        Hi ${user?.userName || ""}. Welcome to Xedla!
        <br />
        We help you connect with trust...
        <p>
        Here is your OTP for verification: ${OTP}.
        </p>
        <br />
        (Expires in 30 minutes)`,
        }),
      ]);

      // Send response back
      res.status(201).send({
        success: true,
        message: "Registration successful",
        user: userResponse,
      });
    } catch (error: any) {
      if (error?.response?.data) {
        return res.status(400).json({
          success: false,
          message:
            error?.response?.data?.message ||
            "An error occured while creating your account",
          error: error?.response?.data,
        });
      }

      const errors = handleError(error);
      res.status(400).json({
        message: "An error occurred while creating your account",
        error: errors,
      });
    }
  }
};

export const auth_login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userData: UserModelType = { email, password: password.trim() };

  try {
    const user = await (User as any).loginWithEmail(userData);

    console.log(user);

    if (!user) {
      const error = { email: "Email does not exist" };

      return res.status(400).send({
        success: false,
        message: "User account does not exist",
        error,
      });
    }

    // Create token
    const token = createToken(user._id);

    // Split user response
    const { password, loginPin, transactionPin, bvn, ...userResponse } =
      user._doc;


    userResponse.token = token;
    const expriryTime = 3 * 24 * 60 * 60;
    
    // Send response back
    res
    .status(201).cookie("authorization", token, { httpOnly: true, maxAge: expriryTime * 1000 })
      .send({ success: true, message: "Login successful", user: userResponse });
  } catch (error: any) {
    if (error?.response?.data) {
      await User.findOneAndDelete({ email }).exec();
      return res.status(400).json({
        success: false,
        message:
          error?.response?.data?.message ||
          "An error occured while creating your account",
        error: error?.response?.data,
      });
    }
    const errors = handleError(error);
    res.status(400).json({
      success: false,
      message: "An error occured while loggin you in",
      error: errors,
    });
  }
};

export const get_otp = async (req: Request, res: Response) => {
  try {
    // Get ID from token
    const ID = getToken(req);

    // Get User
    const user = await User.findById(ID);
    console.log(user);
    if (user?.hasVerifiedEmail)
      return res.status(200).json({
        success: true,
        message: "Email address already verified",
      });

    //  Generate and send OTP
    const OTP = randomize("A0", 6);
      

    await Promise.all([
      OTPVerification.updateOne(
        {
          user: user?._id,
        },
        {
          user: user?._id,
          OTP,
          verificationType: "email",
        },
        {
          upsert: true,
        }
      ),
      sendSMTPEmail({
        to: user?.email as string,
        subject: "OTP Verification",
        text: `
        Hi ${user?.userName || ""}.
        <p>
        Here is your OTP for verification: ${OTP}.
        </p>
        <br />
        (Expires in 30 minutes)`,
      }),
    ]);

    // Send response back
    res.status(201).send({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, message: "An error occured" });
  }
};

export const otp_verify = async (req: Request, res: Response) => {
  try {
    const { OTP } = req.body;
    // Get ID from token
    const ID = getToken(req);

    // // Get User
    // const user = await User.findById(ID);

    const [OTPData, user] = await Promise.all([
      OTPVerification.findOne({ OTP }),
      User.findById(ID),
    ]);
    console.log({ OTPData });
    console.log({ user });

    if (!OTPData || !user) {
      if (!OTPData) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid OTP sent" });
      }
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "No User found" });
      }
    } else {
      if (user?.hasVerifiedEmail)
        return res.status(400).json({
          success: false,
          message: "Your email has been verified already",
        });

      if (user?.account && user?.account?.bankName)
        return res.status(400).json({
          success: false,
          message: "Virtual Account already created for this user",
        });

      const blocData = { customer_id: user?.customerID };
      const virtualAccount = await BlocHQConnect.post("/accounts", blocData);

      console.log({ virtualAccount });

      const account = {
        id: virtualAccount.data?.data?.id,
        bankName: virtualAccount.data?.data?.bank_name,
        accountNumber: virtualAccount.data?.data?.account_number,
      };

      const payload = { hasVerifiedEmail: true, account };

      const updatedUser = await User.findByIdAndUpdate(ID, payload, {
        useFindAndModify: false,
        new: true,
        select: { password: 0, loginPin: 0, transactionPin: 0, bvn: 0 },
      });

      await OTPVerification.findOneAndDelete({ OTP });

      // Send response back
      res.status(201).send({
        message: `Email verified successfully`,
        user: updatedUser,
      });
    }
  } catch (error: any) {
    if (error?.response?.data) {
      return res.status(400).json({
        success: false,
        message:
          error?.response?.data?.message ||
          "An error occured while creating your account",
        error: error?.response?.data,
      });
    }

    res
      .status(400)
      .send({ success: false, message: "An error occured", error });
  }
};

export const tier_1_auth = async (
  req: Request<Record<string, never>, unknown, Tier1Request>,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid data sent.",
      error: errors.array(),
    });
  } else {
    try {
      const { address, dateOfBirth, gender, image, placeOfBirth } = req.body;
      const xedlaUpdateData: UserModelType = {
        verificationLevel: 1,
        address,
        dateOfBirth,
        gender,
        profilePicture: image,
        placeOfBirth,
      };
      const blocData = {
        address: {
          street: address.state,
          city: address.city,
          state: address.state,
          postal_code: address.postalCode,
        },
        image: image.url,
        country: address.country,
        gender,
        dob: dateOfBirth,
        place_of_birth: placeOfBirth,
      };

      // Get ID from token
      const ID = getToken(req);

      // Get User
      const user = await User.findById(ID);

      if (!user)
        return res
          .status(400)
          .send({ success: false, message: "User not found" });

      const validateTier1User = async () => {
        const [userUpdate, blocTier1Kyc] = await Promise.allSettled([
          User.findByIdAndUpdate(ID, xedlaUpdateData, {
            useFindAndModify: false,
            new: true,
            select: { password: 0, loginPin: 0, transactionPin: 0, bvn: 0 },
          }).exec(),
          BlocHQConnect.put(
            `/customers/upgrade/t1/${user?.customerID}`,
            blocData
          ),
        ]);

        if (
          userUpdate.status === "fulfilled" &&
          blocTier1Kyc.status === "fulfilled"
        ) {
          return res.status(200).send({
            success: true,
            message: "Your account has been upgraded to tier-1 successfully",
            user: userUpdate.value,
          });
        } else {
          throw new Error("An error occurred while upgrading your account");
        }
      };

      switch (user?.verificationLevel) {
        case 0:
          // Validate request body
          validateTier1User();
          break;
        case 1:
          return res.status(403).send({
            message:
              "You are already authenticated for this Tier level. Please try authenticating for Tier-2",
          });
          break;
        case 2:
          return res.status(403).send({
            message:
              "You are already authenticated for this Tier level. Please try authenticating for Tier-3",
          });
          break;
        case 3:
          return res.status(403).send({
            message: "You are already authenticated for this Tier level",
          });
          break;
        default:
          return res
            .status(400)
            .send({ message: "Invalid verification level" });
          break;
      }
    } catch (error: any) {
      if (error?.response?.data) {
        return res.status(400).json({
          success: false,
          message:
            error?.response?.data?.message ||
            "An error occured while creating your account",
          error: error?.response?.data,
        });
      }

      res
        .status(400)
        .send({ success: false, message: "An error occured", error });
    }
  }
};

export const tier_2_auth = async (
  req: Request<Record<string, never>, unknown, Tier2Request>,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid data sent.",
      error: errors.array(),
    });
  } else {
    try {
      const { meansOfID, image } = req.body;
      let xedlaUpdateData: UserModelType;

      switch (meansOfID) {
        case "Drivers License":
          xedlaUpdateData = {
            verificationLevel: 2,
            meansOfID,
            driversLicense: image,
          };
          break;
        case "Voters Card":
          xedlaUpdateData = {
            verificationLevel: 2,
            meansOfID,
            votersCard: image,
          };
          break;
        case "International Passport":
          xedlaUpdateData = {
            verificationLevel: 2,
            meansOfID,
            internationalPassport: image,
          };
          break;
        case "National ID Card":
          xedlaUpdateData = {
            verificationLevel: 2,
            meansOfID,
            nationalIDCard: image,
          };
          break;
        case "NIN Slip":
          xedlaUpdateData = {
            verificationLevel: 2,
            meansOfID,
            NINSlip: image,
          };
          break;
        default:
          // If meansOfID is not a valid value, throw an error
          return res.status(400).send({
            success: false,
            message: "Invalid value for meansOfID",
          });
      }

      const blocData = {
        means_of_id: meansOfID,
        image: image.url,
      };

      // Get ID from token
      const ID = getToken(req);

      // Get User
      const user = await User.findById(ID);

      if (!user)
        return res
          .status(400)
          .send({ success: false, message: "User not found" });

      const validateTier2User = async () => {
        const [userUpdate, blocTier2Kyc] = await Promise.allSettled([
          User.findByIdAndUpdate(ID, xedlaUpdateData, {
            useFindAndModify: false,
            new: true,
            select: { password: 0, loginPin: 0, transactionPin: 0, bvn: 0 },
          }).exec(),
          BlocHQConnect.put(
            `/customers/upgrade/t2/${user?.customerID}`,
            blocData
          ),
        ]);

        if (
          userUpdate.status === "fulfilled" &&
          blocTier2Kyc.status === "fulfilled"
        ) {
          return res.status(200).send({
            success: true,
            message: "Your account has been upgraded to tier-2 successfully",
            user: userUpdate.value,
          });
        } else {
          // throw new Error("An error occurred while upgrading your account");
          res.status(400).send({
            success: false,
            message: "An error occured while upgrading your account",
            error: blocTier2Kyc,
          });
        }
      };

      switch (user?.verificationLevel) {
        case 0:
          // Validate request body
          return res.status(403).send({
            message:
              "Please update your account to tier-1 first before authenticating for Tier-2",
          });

          break;
        case 1:
          validateTier2User();
          break;
        case 2:
          return res.status(403).send({
            message:
              "You are already authenticated for this Tier level. Please try authenticating for Tier-3",
          });
          break;
        case 3:
          return res.status(403).send({
            message: "You are already authenticated for this Tier level",
          });
          break;
        default:
          return res
            .status(400)
            .send({ message: "Invalid verification level" });
          break;
      }
    } catch (error: any) {
      console.log(error);
      if (error?.response?.data) {
        return res.status(400).json({
          success: false,
          message:
            error?.response?.data?.message ||
            "An error occured while creating your account",
          error: error?.response?.data,
        });
      }

      res
        .status(400)
        .send({ success: false, message: "An error occured", error });
    }
  }
};

export const tier_3_auth = async (
  req: Request<Record<string, never>, unknown, TierBasicRequest>,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid data sent.",
      error: errors.array(),
    });
  } else {
    try {
      const { image } = req.body;
      const xedlaUpdateData: UserModelType = {
        verificationLevel: 3,
      };
      const blocData = {
        image: image.url,
      };

      // Get ID from token
      const ID = getToken(req);

      // Get User
      const user = await User.findById(ID);

      if (!user)
        return res
          .status(400)
          .send({ success: false, message: "User not found" });

      const validateTier3User = async () => {
        const [userUpdate, blocTier2Kyc] = await Promise.allSettled([
          User.findByIdAndUpdate(ID, xedlaUpdateData, {
            useFindAndModify: false,
            new: true,
            select: { password: 0, loginPin: 0, transactionPin: 0, bvn: 0 },
          }).exec(),
          BlocHQConnect.put(
            `/customers/upgrade/t3/${user?.customerID}`,
            blocData
          ),
        ]);

        if (
          userUpdate.status === "fulfilled" &&
          blocTier2Kyc.status === "fulfilled"
        ) {
          return res.status(200).send({
            success: true,
            message: "Your account has been upgraded to tier-3 successfully",
            user: userUpdate.value,
          });
        } else {
          // throw new Error("An error occurred while upgrading your account");
          res.status(400).send({
            success: false,
            message: "An error occured while upgrading your account",
            error: blocTier2Kyc,
          });
        }
      };

      switch (user?.verificationLevel) {
        case 0:
          // Validate request body
          return res.status(403).send({
            message:
              "Please update your account to tier-1 first before authenticating for Tier-2 or 3",
          });

          break;
        case 1:
          return res.status(403).send({
            message:
              "Please update your account to tier-2 first before authenticating for Tier-3",
          });
          break;
        case 2:
          validateTier3User();
          break;
        case 3:
          return res.status(403).send({
            message: "You are already authenticated for this Tier level",
          });
          break;
        default:
          return res
            .status(400)
            .send({ message: "Invalid verification level" });
          break;
      }
    } catch (error: any) {
      console.log(error);
      if (error?.response?.data) {
        return res.status(400).json({
          success: false,
          message:
            error?.response?.data?.message ||
            "An error occured while creating your account",
          error: error?.response?.data,
        });
      }

      res
        .status(400)
        .send({ success: false, message: "An error occured", error });
    }
  }
};

export const validate_transaction_pin = async (req: Request, res: Response) => {
  const { email, transactionPin } = req.body;

  const userData: UserModelType = { email, transactionPin };

  try {
    const user = await (User as any).validateTransactionPinWithEmail(userData);

    if (user) {
      // Send response back
      res.status(201).send({ success: true, message: "Pin Validated" });
    } else {
      const error = { email: "Email does not exist" };

      res.status(400).send({
        success: false,
        message: "User account does not exist",
        error,
      });
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err?.message
        ? err?.message
        : "An error occured while validating your pin",
      error: err,
    });
  }
};

export const reset_transaction_pin = async (req: Request, res: Response) => {
  const email = req.body.email;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ errors: { email: "Email does not exist" } });
  }

  const token = randomize("A0", 6);

  try {
    await Promise.all([
      PassReset.updateOne(
        {
          user: user?._id,
        },
        {
          user: user?._id,
          token: token,
        },
        {
          upsert: true,
        }
      ),
      sendSMTPEmail({
        to: email,
        subject: "Xedla Transaction Pin Reset",
        text: `<p>Hi ${user?.userName}, here's your pin reset code: ${token}.</p>
      <br />
        If you did not request this code, ignore it.
        (Code expires in 15 minutes anyway)`,
      }),
    ]);

    // Send response back
    const message =
      "Check your email address for the transaction pin reset code!";

    res.status(201).send({ success: true, message });
  } catch (error) {
    console.log({ error });
  }
};

export const set_transaction_pin = async (req: Request, res: Response) => {
  const { token, transactionPin } = req.body;
  if (!transactionPin || transactionPin.length !== 4) {
    if (!transactionPin) {
      return res.status(400).json({
        message: "Transaction Pin not set",
        errors: { pin: "Transaction Pin not set or invalid" },
      });
    }
    if (transactionPin.length !== 4) {
      return res.status(400).json({
        message: "Transaction Pin must be 4 digits",
        errors: { pin: "Transaction Pin must be 4 digits" },
      });
    }
  }
  const passwordReset = await PassReset.findOne({ token });

  if (!passwordReset) {
    res
      .status(400)
      .json({ success: false, message: "Invalid reset code sent" });
  } else {
    /* Update user */
    const user = await User.findOne({ _id: passwordReset.user });
    user!.transactionPin = transactionPin;
    user!.hasSetTransactionPin = true;

    user
      ?.save()
      .then(async (savedUser: any) => {
        /* Delete password reset document in collection */
        await PassReset.deleteOne({ _id: passwordReset._id });
        res.status(200).json({
          success: true,
          message: "Transactionn Pin updated Successfully",
        });
      })
      .catch((error: any) => {
        res.status(400).json({
          success: false,
          message: "Failed to change transaction pin. Please try again",
          error,
        });
      });
  }
};

export const login_with_pin = async (req: Request, res: Response) => {
  const { email, loginPin } = req.body;

  const userData: UserModelType = { email, loginPin };

  try {
    const user = await (User as any).loginWithPinAndEmail(userData);

    if (user) {
      // Send response back
      res
        .status(200)
        .send({ success: true, message: "Login Pin Validated", user });
    } else {
      const error = { email: "Email does not exist" };

      res.status(400).send({
        success: false,
        message: "User account does not exist",
        error,
      });
    }
  } catch (err: any) {
    res.status(400).json({
      message: err?.message
        ? err?.message
        : "An error occured while validating your pin",
      success: false,
      error: err,
    });
  }
};

export const login_pin_reset = async (req: Request, res: Response) => {
  const email = req.body.email;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ errors: { email: "Email does not exist" } });
  }

  const token = randomize("A0", 6);

  try {
    await Promise.all([
      PassReset.updateOne(
        {
          user: user?._id,
        },
        {
          user: user?._id,
          token: token,
        },
        {
          upsert: true,
        }
      ),
      sendSMTPEmail({
        to: email,
        subject: "Xedla Login Pin Reset",
        text: `<p>Hi ${user?.userName}, here's your login pin reset code: ${token}.</p>
        If you did not request this code, ignore it.
        (Code expires in 15 minutes anyway)`,
      }),
    ]);

    // Send response back
    const message = "Check your email address for the password reset code!";

    res.status(200).send({ success: true, message });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "An error occured while sending your reset pin",
      error,
    });
  }
};

export const set_login_pin = async (req: Request, res: Response) => {
  const ID = getToken(req);
  const { token, loginPin } = req.body;
  if (!ID && !token) {
    const error: { userToken?: string; resetToken?: string } = {};
    if (!ID) {
      error.userToken = "Unable to validate user";
    }
    if (!token) {
      error.resetToken = "Token not sent or invalid";
    }

    return res.status(401).json({
      success: false,
      message: "Unable to validate user",
      error,
    });
  }

  if (loginPin.length !== 6) {
    return res.status(400).json({
      success: false,
      message: "Login Pin must be 6 digits",
      errors: { pin: "Login Pin must be 6 digits" },
    });
  }

  if (token) {
    if (token.length === 6) {
      if (loginPin.length !== 6) {
        return res.status(400).json({
          message: "Login pin must be 6 digits",
          errors: { pin: "Login pin must be 6 digits" },
        });
      }
      const passwordReset = await PassReset.findOne({ token });
      console.log(passwordReset);
      if (!passwordReset) {
        res
          .status(400)
          .json({ success: false, message: "Invalid auth code sent" });
      } else {
        /* Update user */
        const user = await User.findOne({ _id: passwordReset.user });
        user!.loginPin = loginPin;
        user!.hasSetLoginPin = true;

        user!
          .save()
          .then(async (savedUser: any) => {
            const { loginPin, transactionPin, password, bvn, ...user } =
              savedUser._doc;
            /* Delete password reset document in collection */
            await PassReset.deleteOne({ _id: passwordReset._id });
            res.status(200).json({
              success: true,
              message: "Login pin updated Successfully",
              user,
            });
          })
          .catch((error: any) => {
            res.status(400).json({
              success: false,
              message: "Failed to change login pin. Please try again",
              error,
            });
          });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Login Reset Token not sent or invalid",
        errors: { token: "Login Reset Token not sent or invalid" },
      });
    }
  } else {
    const sentUser = await User.findById(ID);
    if (!sentUser?.loginPin) {
      sentUser!.loginPin = loginPin;
      sentUser!.hasSetLoginPin = true;

      sentUser!
        .save()
        .then(async (savedUser: any) => {
          const { loginPin, transactionPin, password, bvn, ...user } =
            savedUser._doc;
          return res.status(200).json({
            success: true,
            message: "Login pin updated Successfully",
            user,
          });
        })
        .catch((error: any) => {
          res.status(400).json({
            success: false,
            message: "Failed to change login pin. Please try again",
            error,
          });
        });
    } else {
      res.status(400).json({
        success: false,
        message: "Login pin already set. Reset if you want to change it",
        errors: { loginPin: "Login pin already set" },
      });
    }
  }
};

export const auth_password_reset = async (req: Request, res: Response) => {
  const email = req.body.email;

  const user = await User.findOne({ email });
  if (!user) {
    res
      .status(400)
      .json({ success: false, errors: { email: "Email does not exist" } });
  }

  const token = randomize("A0", 6);

  try {
    await Promise.all([
      PassReset.updateOne(
        {
          user: user?._id,
        },
        {
          user: user?._id,
          token: token,
        },
        {
          upsert: true,
        }
      ),
      sendSMTPEmail({
        to: email,
        subject: "Xedla Password Reset",
        text: `<p>Hi ${user?.userName}, here's your password reset code: ${token}.</p>
        If you did not request this code, ignore it.
        (Code expires in 15 minutes anyway)`,
      }),
    ]);

    // Send response back
    const message = "Check your email address for the password reset code!";

    res.status(200).send({ success: true, message });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "An error occured while sending your reset pin",
      error,
    });
  }
};

export const auth_set_password = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const passwordReset = await PassReset.findOne({ token });

  if (!passwordReset) {
    res.status(400).json({ success: false, message: "Invalid auth code sent" });
  } else {
    /* Update user */
    const user = await User.findOne({ _id: passwordReset.user });
    user!.password = password;

    user!
      .save()
      .then(async (savedUser: any) => {
        /* Delete password reset document in collection */
        await PassReset.deleteOne({ _id: passwordReset._id });
        res.json({ success: true, message: "Password Changed Successfull" });
      })
      .catch((error: any) => {
        res.status(400).json({
          success: false,
          message: "Failed to reset password please try again",
          error,
        });
      });
  }
};
