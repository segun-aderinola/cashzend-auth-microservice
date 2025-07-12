import { NextFunction, Request, Response } from "express";

type ValidateErrorType = {
  email?: string;
  phoneNumber?: string;
  password?: string;
  authType?: string;
  BVN?: string;
  loginPin?: string;
};

export const authValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let hasError = false;
  const errors: ValidateErrorType = {};
  const { email, phoneNumber, password } = req.body;

  if (!email || !password) {
    if (!email) {
      errors.email = "Email not sent";
    }
    if (!password) {
      errors.password = "Pin not sent";
    }
    hasError = true;
  }

  if (hasError) {
    res.status(400).send({ message: "Incomplete details sent", errors });
    res.end();
  } else {
    next();
  }
};
export const authPinValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let hasError = false;
  const errors: ValidateErrorType = {};
  const { email, loginPin } = req.body;

  if (!email || !loginPin) {
    if (!email) {
      errors.email = "Email not sent";
    }
    if (!loginPin) {
      errors.password = "Pin not sent";
    }
    hasError = true;
  }

  if (hasError) {
    res.status(400).send({ message: "Incomplete details sent", errors });
    res.end();
  } else {
    next();
  }
};

export const transactionPinValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let hasError = false;
  const errors: ValidateErrorType = {};
  const { email, transactionPin } = req.body;

  if (!email || !transactionPin) {
    if (!email) {
      errors.email = "Email not sent";
    }
    if (!transactionPin) {
      errors.password = "Transaction pin not sent";
    }
    hasError = true;
  }

  if (transactionPin.length !== 4) {
    res
      .status(400)
      .send({
        success: false,
        message: "Your tranaction pin should be 4 digits",
      });
  }

  if (hasError) {
    res.status(400).send({
      success: false,
      message: "Incomplete details sent",
      error: errors,
    });
    res.end();
  } else {
    next();
  }
};

// export const isAdmin
