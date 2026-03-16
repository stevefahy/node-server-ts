import passport from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  JwtFromRequestFunction,
} from "passport-jwt";
import { Opts } from "../types";

const ExtractedJwt: JwtFromRequestFunction =
  ExtractJwt.fromAuthHeaderAsBearerToken();

const opts: Opts = {
  jwtFromRequest: ExtractedJwt,
  secretOrKey: process.env.JWT_SECRET,
};

// Validate JWT only — no DB lookup. Lets requests reach route handlers so they
// can return operation-specific errors (e.g. "We couldn't create the notebook")
// when MongoDB is down, instead of hanging at auth.
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    if (!jwt_payload._id) {
      return done(null, false);
    }
    return done(null, { _id: jwt_payload._id } as Express.User);
  })
);
