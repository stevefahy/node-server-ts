import * as dotenv from "dotenv";
import path from "path";

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
