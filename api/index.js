import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import useRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connect to MongoDb");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());

app.use(cookieParser())

app.listen(3000, () => {
  console.log("server is running on port 3000!!");
});

app.use("/api/user", useRouter);
app.use("/api/auth", authRouter);

app.use((err, request, response, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return response.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
