import "./loadEnv";
import "./strategies/JwtStrategy";
import "./strategies/LocalStrategy";
import "./authenticate";
import { initDB } from "./util/initdb";
import { createApp } from "./app";
import { closeNativeMongoClient } from "./util/db_connect";

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
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

const DB_CONNECTION = initDB();

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `New Server is running on port:${PORT}. DB ${process.env.MONGODB_DB_NAME}. DB Connection status: ${DB_CONNECTION}`,
  );
});

const shutdown = async () => {
  server.close();
  await closeNativeMongoClient();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
