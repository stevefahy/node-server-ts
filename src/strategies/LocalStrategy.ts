import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user";

//Called during login/sign up.
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    User.authenticate()
  )
);

//called while after logging in / signing up to set user details in req.user
passport.serializeUser(User.serializeUser());
User.serializeUser();
