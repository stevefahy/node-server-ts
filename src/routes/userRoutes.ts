import express from "express";
import User from "../models/user";
import passport from "passport";
import { UserInterface } from "../types";
import { changeUsername } from "../route_helpers/user/change-username";
import { errString } from "../util/errorString";
import { changePassword } from "../route_helpers/user/change-password";
import { refreshTheToken } from "../route_helpers/user/refresh-token";
import { logout } from "../route_helpers/user/logout";
import APPLICATION_CONSTANTS from "../application_constants/applicationConstants";
import {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
  verifyUser,
} from "../authenticate";
import { signup } from "../route_helpers/user/signup";

function getRefreshTokenCookieName(req: express.Request): string {
  const origin = req.headers.origin || '';
  const match = origin.match(/https:\/\/([^.]+)\.snipbee\.com/);
  return match ? `refreshToken_${match[1]}` : 'refreshToken';
}

const router = express.Router();

const AC = APPLICATION_CONSTANTS;

router.post("/signup", async (req, res) => {
  const { username, email, password, framework } = req.body;
  if (!email || email === undefined || null) {
    res.statusCode = 400;
    res.send({ error: `${AC.SIGNUP_REQUIRED_EMAIL}` });
    return;
  } else if (!password || password === undefined || null) {
    res.statusCode = 400;
    res.send({ error: `${AC.SIGNUP_REQUIRED_PASSWORD}` });
    return;
  } else if (!username || username === undefined || null) {
    res.statusCode = 400;
    res.send({ error: `${AC.SIGNUP_REQUIRED_USERNAME}` });
    return;
  }
  if (username.length < AC.USERNAME_MIN) {
    res.statusCode = 400;
    res.send({ error: `${AC.CHANGE_USER_TOO_FEW}` });
    return;
  }
  if (username.length > AC.USERNAME_MAX) {
    res.statusCode = 400;
    res.send({ error: `${AC.CHANGE_USER_TOO_MANY}` });
    return;
  }
  if (password.length < AC.PASSWORD_MIN) {
    res.statusCode = 400;
    res.send({ error: `${AC.CHANGE_PASS_TOO_FEW}` });
    return;
  }
  if (password.length > AC.PASSWORD_MAX) {
    res.statusCode = 400;
    res.send({ error: `${AC.CHANGE_PASS_TOO_MANY}` });
    return;
  }

  try {
    const response = await signup(username, email, password, framework);
    if (response) {
      if (response.refreshToken) {
        res.cookie(getRefreshTokenCookieName(req), response.refreshToken, COOKIE_OPTIONS);
        delete response.refreshToken;
      }
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err, AC.SIGNUP_GENERAL);
    res.statusCode = 400;
    res.send({ error: `${errMessage}` });
    return;
  }
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.length < AC.EMAIL_MIN) {
    res.statusCode = 400;
    res.send({ error: `${AC.SIGNUP_INVALID_EMAIL}` });
    return;
  }
  if (!password || password.length < AC.PASSWORD_MIN) {
    res.statusCode = 400;
    res.send({ error: `${AC.SIGNUP_INVALID_PASSWORD}` });
    return;
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  passport.authenticate("local", (err: unknown, user: any) => {
    // if an error was returned by the strategy, send it to the client
    if (err) {
      res.send({ error: err });
      return;
    }
    // manually setting the logged in user to req.user
    req.user = user;
    if (!req.user) {
      res.statusCode = 401;
      res.send({ error: AC.INVALID_EMAIL_PASSWORD });
      return;
    }

    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });

    try {
      User.findById(req.user._id).then(
        (user: UserInterface | null) => {
          if (user === null) {
            res.statusCode = 401;
            res.send({ error: AC.INVALID_EMAIL_PASSWORD });
            return;
          }
          user.refreshToken.push({ refreshToken });
          try {
            user.save();
            res.cookie(getRefreshTokenCookieName(req), refreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token, details: user });
          } catch (err) {
            res.statusCode = 500;
            res.send({ error: `${AC.GENERAL_ERROR}` });
          }
        },
        (err) => {
          next({ error: err });
        }
      );
    } catch (error) {
      res.statusCode = 401;
      res.send({ error: AC.UNAUTHORIZED_USER });
      return;
    }
  })(req, res, next);
});

router.get("/logout", verifyUser, async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!refreshToken) {
    res.statusCode = 500;
    res.send({ error: `${AC.UNAUTHORIZED_JWT}` });
    return;
  }

  try {
    const response = await logout(refreshToken);
    if (response) {
      res.clearCookie(getRefreshTokenCookieName(req), COOKIE_OPTIONS);
      res.send(response);
      return;
    }
  } catch (error: unknown) {
    const errMessage = errString(error, AC.LOGOUT_ERROR);
    res.statusCode = 401;
    res.send({ error: `${errMessage}` });
    return;
  }
});

router.get("/refreshtoken", async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];

  try {
    const response = await refreshTheToken(refreshToken);
    if (response) {
      res.cookie(getRefreshTokenCookieName(req), response.newRefreshToken, COOKIE_OPTIONS);
      //Remove refreshToken from the response
      delete response.newRefreshToken;
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err, AC.UNAUTHORIZED_USER);
    res.statusCode = 401;
    res.send({ error: `${errMessage}` });
    return;
  }
});

router.post("/change-username", verifyUser, async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];
  const { newUsername } = req.body;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!refreshToken) {
    res.statusCode = 500;
    res.send({ error: `${AC.UNAUTHORIZED}` });
    return;
  }

  try {
    const response = await changeUsername(newUsername, refreshToken);
    if (response) {
      res.send(response);
      return;
    }
  } catch (error: unknown) {
    const errMessage = errString(error, AC.CHANGE_USER_ERROR);
    res.statusCode = 401;
    res.send({ error: `${errMessage}` });
    return;
  }
});

router.patch("/change-password", verifyUser, async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];
  const { oldPassword, newPassword } = req.body;

  if (!req.user) {
    res.statusCode = 400;
    res.send({ error: `${AC.UNAUTHORIZED}` });
    return;
  }
  if (!refreshToken) {
    res.statusCode = 500;
    res.send({ error: `${AC.UNAUTHORIZED}` });
    return;
  }

  try {
    const response = await changePassword(
      oldPassword,
      newPassword,
      refreshToken
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (error: unknown) {
    const errMessage = errString(error, AC.CHANGE_PASS_ERROR);
    res.statusCode = 401;
    res.send({ error: `${errMessage}` });
    return;
  }
});

export const userRouter = router;
