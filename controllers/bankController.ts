import { Request, Response } from "express";
import BlocHQConnect from "../services/blochq";
import { GetBankAccountRequest } from "../types/requests";
import { validationResult } from "express-validator";

export const get_bank_list = async (req: Request, res: Response) => {
  const { data } = await BlocHQConnect.get(`/banks`);
  res.send({
    success: true,
    message: "Banks gotten successfully",
    data: data?.data,
  });
};
export const get_bank_account = async (
  req: Request<Record<string, never>, unknown, GetBankAccountRequest>,
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
      const { accountNumber, bankCode } = req.query;
      const blocData = {
        account_number: accountNumber,
        bank_code: bankCode,
      };
      const { data } = await BlocHQConnect.get(`/resolve-account`, {
        params: blocData,
      });

      res.send({
        success: true,
        message: "Account details gotten successfully",
        data: data?.data,
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

      res
        .status(400)
        .send({ success: false, message: "An error occured", error });
    }
  }
};
