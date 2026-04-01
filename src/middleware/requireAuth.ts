import { RequestHandler } from "express";
import APPLICATION_CONSTANTS from "../application_constants/applicationConstants";

const AC = APPLICATION_CONSTANTS;

/** Ensures JWT auth ran and `req.user` is set (narrowing for handlers). */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).send({ error: AC.UNAUTHORIZED_USER });
    return;
  }
  next();
};
