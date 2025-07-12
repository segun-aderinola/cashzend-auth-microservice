import { Request, Response } from "express";
import { getToken } from "../functions/token";
import User from "../models/userModel";
import BlocHQConnect from "../services/blochq";
import { CentralAccountFundingRequest } from "../types/requests";
import { validationResult } from "express-validator";

export const get_my_wallet = async (req: Request, res: Response) => {
  try {
    const ID = getToken(req);
    const user = await User.findById(ID);

    if (user) {
      if (!user.account || !user.account?.id) {
        return res.status(400).send({
          success: false,
          message: "User doesn't have an account",
        });
      }
      const { data } = await BlocHQConnect.get(
        `/accounts/${user?.account?.id}`
      );

      console.log(data);
      const {
        id,
        name,
        bvn,
        kyc_tier,
        balance,
        currency,
        customer_id,
        account_number,
        bank_name,
      } = data.data;
      const account = {
        id,
        name,
        bvn,
        kyc_tier,
        balance,
        currency,
        customer_id,
        account_number,
        bank_name,
      };

      res.send({
        success: true,
        message: "Account gotten successfully",
        account,
      });
    } else {
      res.status(400).send({ success: false, message: "User doesn't exist" });
    }
  } catch (error) {
    res.send({ success: false, message: "Error fetching user", error });
  }
};

export const get_wallet = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (!user.account || !user.account?.id) {
        return res.status(400).send({
          success: false,
          message: "User doesn't have an account",
        });
      }
      const { data } = await BlocHQConnect.get(
        `/accounts/${user?.account?.id}`
      );

      console.log(data);
      const {
        id,
        name,
        bvn,
        kyc_tier,
        balance,
        currency,
        customer_id,
        account_number,
        bank_name,
      } = data.data;
      const account = {
        id,
        name,
        bvn,
        kyc_tier,
        balance,
        currency,
        customer_id,
        account_number,
        bank_name,
      };

      res.send({
        success: true,
        message: "Account gotten successfully",
        account,
      });
    } else {
      res.status(400).send({ success: false, message: "User doesn't exist" });
    }
  } catch (error) {
    res.send({ success: false, message: "Error fetching user", error });
  }
};

export const central_account_funding = async (
  req: Request<Record<string, never>, unknown, CentralAccountFundingRequest>,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid data sent.",
      error: errors.array(),
    });
  }
  try {
    const { accountNumber, amount, bankCode, narration } = req.body;
    const blocData = {
      account_number: accountNumber,
      amount,
      bank_code: bankCode,
      narration,
    };
    const { data } = await BlocHQConnect.post("/transfers/balance", blocData);
    console.log(data);
    console.log(data?.data);

    res.send({
      success: true,
      message: "Account funded successfully",
      data: data?.data,
    });
  } catch (error: any) {
    console.log(error?.response);
    res
      .status(400)
      .send({ success: false, message: "An error occured", error });
  }
};
