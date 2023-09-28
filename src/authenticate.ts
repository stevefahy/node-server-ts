import passport from "passport";
import jwt from "jsonwebtoken";
import { userToken } from "./types";

const dev = process.env.NODE_ENV === "development";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  // Since localhost does not have https protocol,
  // secure cookies do not work correctly (in postman)
  signed: true,
  secure: !dev,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY),
  SameSite: "none",
};

export const getToken = (user: userToken) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY),
  });
};

export const getRefreshToken = (user: userToken) => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });
  return refreshToken;
};

export const verifyUser = passport.authenticate("jwt", { session: false });
