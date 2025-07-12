import * as crypto from "crypto";
import { Request, Response } from "express";
import Transaction from "../models/transactionModel";
import { TransactionModelType } from "../types/models";

const blochq_webhook_secret = process.env.BLOCHQ_WEBHOOK_SECRET || "";
const allowedIPs = ["159.223.160.239", "147.182.169.205"];
export const blochq_webhook = async (req: Request, res: Response) => {
  const getClientIP = () => {
    const xForwardedFor = req.headers["x-forwarded-for"] as string;
    let ip;
    if (xForwardedFor) {
      const ips = xForwardedFor.split(",");
      ip = ips[0].trim();
    }
    return ip;
  };
  const clientIP = getClientIP() || req.ip;

  if (!allowedIPs.includes(clientIP)) return res.sendStatus(403);

  //validate event
  const hash = crypto
    .createHmac("sha256", blochq_webhook_secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash == req.headers["x-bloc-webhook"]) {
    // Retrieve the request's body
    const event = req.body;
    const getTransactionType = (value: string) => {
      if (value) return value.toLowerCase();
      return "transfer";
    };

    const transactionData: TransactionModelType = {
      ...event.data,
      org_record: true,
    };

    // console.log(transactionData);
    await Transaction.create(transactionData);
    return res.sendStatus(200);

    // Do something with event
  }
  return res.status(403).send({
    success: false,
    message: "Invalid webhook signature",
  });
};
