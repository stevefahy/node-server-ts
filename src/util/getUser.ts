import APPLICATION_CONSTANTS from "../application_constants/applicationConstants";
import jwt, { JwtPayload } from "jsonwebtoken";
import { errString } from "./errorString";
import { UserInterface } from "../types";
import User from "../models/user";

const AC = APPLICATION_CONSTANTS;

export const getUser = async (refreshToken: string) => {
  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (typeof payload === "string") {
      throw new Error(`${AC.UNAUTHORIZED}`);
    }
  } catch (err: unknown) {
    const errMessage = errString(err, AC.UNAUTHORIZED_JWT);
    throw new Error(`${errMessage}`);
  }

  const userId = payload._id;
  let user: UserInterface | null;

  try {
    user = await User.findOne({ _id: userId });
    if (user === null) {
      throw new Error(`${AC.UNAUTHORIZED_USER}`);
    }
    return user;
  } catch (err: unknown) {
    const errMessage = errString(err, AC.UNAUTHORIZED_USER);
    throw new Error(`${errMessage}`);
  }
};
