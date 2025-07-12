import express, { Express, Request, Response } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/api";

// Dotenv config
dotenv.config();

// Initialize express server
const app: Express = express();

// Environmental variables
const port = process.env.PORT;
const URI = process.env.MONGODB_URI || "";

// Middlewares
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Express + TypeScript Server" });
});

app.use("/api", routes);

app.use("*", (req: Request, res: Response) => {
  res.status(404).send("Error 404");
});

// Database Connection

mongoose
  .connect(URI)
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err: any) => console.log(err));

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
