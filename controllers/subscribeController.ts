import { Request, Response } from "express";
/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import { subscribeUser } from "../functions/mail";

export const subscribe_waitlist = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (email) {
      const userSubscribed = await subscribeUser(
        "ab11004e-dcbf-45a5-bff1-442b9aed828b",
        email
      );

      if (userSubscribed[0].statusCode === 202) {
        res.status(200).send({
          message: "Hooray! You have successfully joined the waitlist.",
        });
      }

      console.log(userSubscribed);
    } else {
      res.status(400).send({ message: "Please send in your email address" });
    }
  } catch (error) {
    res.status(400).send({ message: "An error occured", error });
  }
};
