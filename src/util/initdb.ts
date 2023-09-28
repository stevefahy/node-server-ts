import mongoose, { ConnectOptions } from "mongoose";
import { errString } from "../util/errorString";

export const initDB = () => {
  try {
    const url = `mongodb://${process.env.MONGODB_USERNAME}:${encodeURIComponent(
      process.env.MONGODB_PASSWORD
    )}@${process.env.MONGODB_URL}/${
      process.env.MONGODB_DB_NAME
    }?authSource=admin`;

    mongoose
      .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions)
      .catch((err) => {
        return `Mongo Connection error: ${err.message}`;
      });
    return `Connected.`;
  } catch (err: unknown) {
    const errMessage = errString(err);
    return `Mongo Connection error: ${errMessage}`;
  }
};
