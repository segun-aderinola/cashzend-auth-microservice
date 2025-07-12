import axios, { AxiosResponse } from "axios";
import { sendGridEmailType } from "../../types/data";
import { _formatEmailHTML, _formatSendGridHTML } from "../../utils/mail";

import nodemailer from "nodemailer";
import sendGridMail, { ClientResponse } from "@sendgrid/mail";
import sendGridClient from "@sendgrid/client";
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY as string);
sendGridClient.setApiKey(process.env.SENDGRID_API_KEY as string);

type MailType = {
  to: string;
  subject: string;
  description?: string;
  text: string;
  ctaText?: string;
  ctaLink?: string;
};

export const sendSMTPEmail = ({
  to,
  subject,
  text,
  ctaText,
  ctaLink,
  description,
}: MailType) => {
  return new Promise((resolve, reject) => {
    let response;

    const transporter = nodemailer.createTransport({
      host: `${process.env.EMAIL_HOST}` || "",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_ADDRESS || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
    });

    /* Send the email */
    const message = {
      from: `"Xedla Pay" <${process.env.EMAIL_ADDRESS}>`,
      to,
      subject,
      html: _formatEmailHTML(
        subject,
        text,
        ctaText || "",
        ctaLink || "",
        description || ""
      ),
    };

    transporter.sendMail(message, (error: any, info: any) => {
      if (error) {
        console.log("Error occurred");
        console.log(error.message);
        response = { status: "fail", error };
        resolve(response);
        // process.exit(1);
      } else {
        response = { status: "success", info };
        resolve(response);
      }

      transporter.close();
    });
  });
};

export const sendGridEmail = async ({
  to,
  subject,
  text,
  html,
}: sendGridEmailType) => {
  const msg = {
    to,
    from: "official@xedla.com",
    fromname: "Xedla Pay",
    subject,
    text,
    html: html ? html : _formatSendGridHTML(text),
  };

  sendGridMail.send(msg);
};

export const subscribeUser = async (listID: string, email: string) => {
  const data = {
    list_ids: [listID],
    contacts: [
      {
        email: email,
      },
    ],
  };
  const request = {
    url: `/v3/marketing/contacts`,
    method: "PUT" as any,
    body: data,
  };
  return sendGridClient.request(request);
};

// ab11004e-dcbf-45a5-bff1-442b9aed828b - waitlist list
