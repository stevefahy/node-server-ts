import passport from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  JwtFromRequestFunction,
} from "passport-jwt";
import User from "../models/user";
import { Opts } from "../types";

const ExtractedJwt: JwtFromRequestFunction =
  ExtractJwt.fromAuthHeaderAsBearerToken();

const opts: Opts = {
  jwtFromRequest: ExtractedJwt,
  secretOrKey: process.env.JWT_SECRET,
};

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    // Check against the DB only if necessary.
    // This can be avoided if you don't want to fetch user details in each request.
    try {
      User.findOne({ _id: jwt_payload._id }).then((user) => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    } catch (err) {
      return done(err, false);
    }
  })
);
