import axios from "axios";
/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
console.log(process.env.TERMII_API_KEY);
export const sendSMS = async (to: string, sms: string): Promise<void> => {
  const data = {
    to,
    from: "Xedla Pay",
    sms,
    type: "plain",
    api_key: process.env.TERMII_API_KEY,
    channel: "generic",
  };
  console.log(data);
  try {
    const response = await axios.post(
      `https://api.ng.termii.com/api/sms/send`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error);
  }
};
