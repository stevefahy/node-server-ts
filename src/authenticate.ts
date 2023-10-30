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
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  SameSite: "none",
};

export const getToken = (user: userToken) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY),
  });

  // const payload = jwt.verify(token, process.env.JWT_SECRET);
  // if(typeof payload !== "string" && payload.exp) {
  //   console.log("getToken", new Date(payload.exp * 1000).toUTCString())
  // }

  return token;
};

export const getRefreshToken = (user: userToken) => {
  const refreshtoken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });

  // const payload = jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET);
  // if(typeof payload !== "string" && payload.exp) {
  //   console.log("getRefreshToken", new Date(payload.exp * 1000).toUTCString())
  // }

  return refreshtoken;
};

export const verifyUser = passport.authenticate("jwt", { session: false });
