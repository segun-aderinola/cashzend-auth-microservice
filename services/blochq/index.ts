import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
// Dotenv config
dotenv.config();
const BASE_URL = "https://api.blochq.io/v1";

let apiToken: string;

if (process.env.NODE_ENV === "staging") {
  apiToken = process.env.BLOCHQ_TEST_SECRET || "";
} else if (process.env.NODE_ENV === "production") {
  apiToken = process.env.BLOCHQ_LIVE_SECRET || "";
} else {
  throw new Error("Invalid environment");
}

const BlocHQConnect: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  },
});

export default BlocHQConnect;
