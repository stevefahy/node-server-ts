import passport from "passport";
import jwt from "jsonwebtoken";
import { userToken } from "./types";
import {
  parseEnvDurationForJwt,
  parseEnvDurationToMs,
} from "./util/parseEnvDuration";

const dev = process.env.NODE_ENV === "development";

/** Options for the HTTP-only refresh token cookie (call per request so env is loaded after dotenv). */
export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    // Since localhost does not have https protocol,
    // secure cookies do not work correctly (in postman)
    signed: true,
    secure: !dev,
    maxAge: parseEnvDurationToMs(
      process.env.REFRESH_TOKEN_EXPIRY,
      "REFRESH_TOKEN_EXPIRY",
    ),
    SameSite: "None" as const,
    path: "/",
  };
}

export const getToken = (user: userToken) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: parseEnvDurationForJwt(
      process.env.SESSION_EXPIRY,
      "SESSION_EXPIRY",
    ),
  });
  return token;
};

export const getRefreshToken = (user: userToken) => {
  const refreshtoken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: parseEnvDurationForJwt(
      process.env.REFRESH_TOKEN_EXPIRY,
      "REFRESH_TOKEN_EXPIRY",
    ),
  });
  return refreshtoken;
};

export const verifyUser = passport.authenticate("jwt", { session: false });
