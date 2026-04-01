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

// Restore user from session when using passport.session()
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
