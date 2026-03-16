import express from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";
import * as dotenv from "dotenv";
import path from "path";
import expressSession from "express-session";
import { initDB } from "./util/initdb";

// Prevent crash when MongoDB is stopped/unreachable during error testing.
// 1. uncaughtException: MongoDB driver can throw from internal setTimeout (not reject).
// 2. unhandledRejection: Node 15+ exits on unhandled promise rejections; catch Mongo errors.
const isMongoConnectionError = (err: unknown): boolean => {
  if (err instanceof Error) {
    const name = err.name;
    const msg = err.message || "";
    return (
      name === "MongoServerSelectionError" ||
      name === "MongoNetworkError" ||
      name === "MongoError" ||
      /ECONNREFUSED|connection.*refused|connect.*refused/i.test(msg)
    );
  }
  if (typeof err === "object" && err !== null && "message" in err) {
    return /ECONNREFUSED|connection.*refused|MongoServerSelection|MongoNetwork/i.test(
      String((err as { message?: unknown }).message),
    );
  }
  return false;
};

process.on("uncaughtException", (err: Error) => {
  if (isMongoConnectionError(err)) {
    console.error(
      "MongoDB connection failed (server unreachable):",
      err.message,
    );
    return;
  }
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  if (isMongoConnectionError(reason)) {
    console.error("MongoDB connection failed (unhandled rejection):", reason);
    return;
  }
  console.error("Unhandled rejection:", reason);
  // In development, log and continue; in production you may want process.exit(1)
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

if (process.env.NODE_ENV === "development") {
  dotenv.config({
    path: path.join(__dirname, ".env.development"),
    override: true,
  });
} else {
  dotenv.config({
    path: path.join(__dirname, ".env.production"),
    override: true,
  });
}

const DB_CONNECTION = initDB();

import "./strategies/JwtStrategy";
import "./strategies/LocalStrategy";
import "./authenticate";

import { userRouter } from "./routes/userRoutes";
import { noteRouter } from "./routes/noteRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for correct Host/X-Forwarded-* when behind NGINX
app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true },
  }),
);

//Add the client URL to the CORS policy

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
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

app.get("/", async function (req, res) {
  res.send({ status: "success" });
});

app.listen(PORT, () => {
  console.log(
    `New Server is running on port:${PORT}. DB ${process.env.MONGODB_DB_NAME}. DB Connection status: ${DB_CONNECTION}`,
  );
});
