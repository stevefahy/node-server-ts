import express from "express";
import User from "../models/user";
import passport from "passport";
import { UserInterface } from "../types";
import { changeUsername } from "../route_helpers/user/change-username";
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
  const origin = req.headers.origin || "";
  let match = origin.match(/https:\/\/([^.]+)\.snipbee\.com/);
  if (!match) {
    const host = req.headers.host || "";
    match = host.match(/^([^.]+)\.snipbee\.com/);
  }
  return match ? `refreshToken_${match[1]}` : "refreshToken";
}

const router = express.Router();

const AC = APPLICATION_CONSTANTS;

router.post("/signup", async (req, res) => {
  const { username, email, password, framework } = req.body;
  if (!email) {
    res.status(400).send({ error: AC.SIGNUP_REQUIRED_EMAIL });
    return;
  }
  if (!password) {
    res.status(400).send({ error: AC.SIGNUP_REQUIRED_PASSWORD });
    return;
  }
  if (!username) {
    res.status(400).send({ error: AC.SIGNUP_REQUIRED_USERNAME });
    return;
  }
  if (username.length < AC.USERNAME_MIN) {
    res.status(400).send({ error: AC.CHANGE_USER_TOO_FEW });
    return;
  }
  if (username.length > AC.USERNAME_MAX) {
    res.status(400).send({ error: AC.CHANGE_USER_TOO_MANY });
    return;
  }
  if (password.length < AC.PASSWORD_MIN) {
    res.status(400).send({ error: AC.CHANGE_PASS_TOO_FEW });
    return;
  }
  if (password.length > AC.PASSWORD_MAX) {
    res.status(400).send({ error: AC.CHANGE_PASS_TOO_MANY });
    return;
  }

  try {
    const response = await signup(username, email, password, framework);
    if (response) {
      if (response.refreshToken) {
        res.cookie(
          getRefreshTokenCookieName(req),
          response.refreshToken,
          COOKIE_OPTIONS,
        );
        delete response.refreshToken;
      }
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("signup error:", err);
    const errorMessage =
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name: string }).name === "UserExistsError"
        ? AC.SIGNUP_EMAIL_REGISTERED
        : AC.SIGNUP_GENERAL;
    res.status(400).send({ error: errorMessage });
    return;
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || email.length < AC.EMAIL_MIN) {
    res.status(400).send({ error: AC.SIGNUP_INVALID_EMAIL });
    return;
  }
  if (!password || password.length < AC.PASSWORD_MIN) {
    res.status(400).send({ error: AC.SIGNUP_INVALID_PASSWORD });
    return;
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  passport.authenticate("local", (err: unknown, user: any) => {
    if (err) {
      console.error("login strategy error:", err);
      res.status(500).send({ error: AC.LOGIN_ERROR });
      return;
    }
    // manually setting the logged in user to req.user
    req.user = user;
    if (!req.user) {
      res.status(401).send({ error: AC.INVALID_EMAIL_PASSWORD });
      return;
    }

    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });

    try {
      User.findById(req.user._id).then(
        (user: UserInterface | null) => {
          if (user === null) {
            res.status(401).send({ error: AC.INVALID_EMAIL_PASSWORD });
            return;
          }
          user.refreshToken.push({ refreshToken });
          try {
            user.save();
            res.cookie(
              getRefreshTokenCookieName(req),
              refreshToken,
              COOKIE_OPTIONS,
            );
            res.send({ success: true, token, details: user });
          } catch (err) {
            console.error("login user.save error:", err);
            res.status(500).send({ error: AC.GENERAL_ERROR });
          }
        },
        (err) => {
          console.error("login User.findById error:", err);
          res.status(500).send({ error: AC.LOGIN_ERROR });
        },
      );
    } catch (error) {
      res.status(401).send({ error: AC.UNAUTHORIZED_USER });
      return;
    }
  })(req, res);
});

router.get("/logout", verifyUser, async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];

  if (!req.user) {
    res.status(401).send({ error: AC.UNAUTHORIZED_USER });
    return;
  }
  if (!refreshToken) {
    res.status(401).send({ error: AC.UNAUTHORIZED_JWT });
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
    console.error("logout error:", error);
    res.status(401).send({ error: AC.LOGOUT_ERROR });
    return;
  }
});

router.get("/refreshtoken", async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];

  if (!refreshToken) {
    res.status(401).send({ error: AC.UNAUTHORIZED_USER });
    return;
  }

  try {
    const response = await refreshTheToken(refreshToken);
    if (response?.error) {
      const status = response.error === AC.GENERAL_ERROR ? 500 : 401;
      res.status(status).send(response);
      return;
    }
    if (response) {
      res.cookie(
        getRefreshTokenCookieName(req),
        response.newRefreshToken,
        COOKIE_OPTIONS,
      );
      delete response.newRefreshToken;
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("refreshtoken error:", err);
    res.status(401).send({ error: AC.UNAUTHORIZED_USER });
    return;
  }
});

router.post("/change-username", verifyUser, async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];
  const { newUsername } = req.body;

  if (!req.user) {
    res.status(401).send({ error: AC.UNAUTHORIZED_USER });
    return;
  }
  if (!refreshToken) {
    res.status(401).send({ error: AC.UNAUTHORIZED });
    return;
  }

  try {
    const response = await changeUsername(newUsername, refreshToken);
    if (response?.error) {
      const status =
        response.error === AC.CHANGE_USER_REQUIRED ||
        response.error === AC.CHANGE_USER_TOO_FEW ||
        response.error === AC.CHANGE_USER_TOO_MANY ||
        response.error === AC.CHANGE_USER_UNIQUE
          ? 400
          : 401;
      res.status(status).send(response);
      return;
    }
    if (response) {
      res.send(response);
      return;
    }
  } catch (error: unknown) {
    console.error("change-username error:", error);
    res.status(401).send({ error: AC.CHANGE_USER_ERROR });
    return;
  }
});

router.patch("/change-password", verifyUser, async (req, res) => {
  const { signedCookies = {} } = req;
  const refreshToken = signedCookies[getRefreshTokenCookieName(req)];
  const { oldPassword, newPassword } = req.body;

  if (!req.user) {
    res.status(401).send({ error: AC.UNAUTHORIZED });
    return;
  }
  if (!refreshToken) {
    res.status(401).send({ error: AC.UNAUTHORIZED });
    return;
  }
  if (!oldPassword || !newPassword) {
    res.status(400).send({ error: AC.CHANGE_PASS_REQUIRED });
    return;
  }

  try {
    const response = await changePassword(
      oldPassword,
      newPassword,
      refreshToken,
    );
    if (response?.error) {
      const status =
        response.error === AC.CHANGE_PASS_TOO_FEW ||
        response.error === AC.CHANGE_PASS_TOO_MANY ||
        response.error === AC.CHANGE_PASS_UNIQUE ||
        response.error === AC.CHANGE_PASS_LENGTH
          ? 400
          : 401;
      res.status(status).send(response);
      return;
    }
    if (response) {
      res.send(response);
      return;
    }
  } catch (error: unknown) {
    console.error("change-password error:", error);
    res.status(401).send({ error: AC.CHANGE_PASS_ERROR });
    return;
  }
});

export const userRouter = router;
