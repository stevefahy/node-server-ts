import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import { userRouter } from "./routes/userRoutes";
import { noteRouter } from "./routes/noteRoutes";
import APPLICATION_CONSTANTS from "./application_constants/applicationConstants";

export function createApp(): express.Application {
  const app = express();

  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(cookieParser(process.env.COOKIE_SECRET));

  const isProd = process.env.NODE_ENV === "production";
  app.use(
    expressSession({
      secret: process.env.EXPRESS_SESSION_SECRET ?? "",
      resave: true,
      saveUninitialized: true,
      cookie: { secure: isProd },
    }),
  );

  const whitelist = process.env.WHITELISTED_DOMAINS
    ? process.env.WHITELISTED_DOMAINS.split(",")
    : [];

  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/auth", userRouter);
  app.use("/api/data", noteRouter);

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Unhandled error:", err);
      res.status(500).send({ error: APPLICATION_CONSTANTS.GENERAL_ERROR });
    },
  );

  app.get("/", (_req, res) => {
    res.send({ status: "success" });
  });

  return app;
}
