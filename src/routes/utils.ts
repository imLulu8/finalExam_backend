import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
const jwtToken = "shhhhhhh";

export const checkErrors = (req: Request,res: Response,next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (errors.array()[0].param === "authorization") {
      return res.status(401).json({ errors: errors.array() });
    }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const isAuth = async (req: Request,res: Response,next: NextFunction) => {
  const auth = req.headers.authorization as string;
  const user = jwt.verify(auth, jwtToken) as { id: string };
  res.locals.userFinded = await User.findById(user.id);
  if (res.locals.userFinded) {
    return next();
  } else {
    return res.status(400).json({ message: "token not valid" });
  }
};

