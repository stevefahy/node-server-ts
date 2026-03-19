import APPLICATION_CONSTANTS from "../application_constants/applicationConstants";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserInterface } from "../types";
import User from "../models/user";

const AC = APPLICATION_CONSTANTS;

export const getUser = async (refreshToken: string) => {
  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (typeof payload === "string") {
      throw new Error(AC.UNAUTHORIZED);
    }
  } catch (err: unknown) {
    console.error("getUser jwt verify error:", err);
    throw new Error(AC.UNAUTHORIZED_JWT);
  }

  const userId = payload._id;
  let user: UserInterface | null;

  try {
    user = await User.findOne({ _id: userId });
    if (user === null) {
      throw new Error(AC.UNAUTHORIZED_USER);
    }
    return user;
  } catch (err: unknown) {
    // Re-throw intentional auth errors (user not found)
    if (err instanceof Error && err.message === AC.UNAUTHORIZED_USER) {
      throw err;
    }
    console.error("getUser findOne error:", err);
    throw new Error(AC.GENERAL_ERROR);
  }
};
