import express, { NextFunction, Response, Request } from "express";
export const app = express();
import mongoose from "mongoose";
import course from "./routes/courses";
import auth from "./routes/auth";

app.use(express.json());

app.use("/v1/auth", auth );
app.use("/v1/courses", course );

app.listen(process.env.PORT || 3001, async () => {
  console.log("Server is running");
  await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB}`);
});

export default app;
