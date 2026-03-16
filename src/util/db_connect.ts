import { Db, MongoClient } from "mongodb";
import { errString } from "./errorString";
import APPLICATION_CONSTANTS from "../application_constants/applicationConstants";
import { DBConnect } from "../types";

const AC = APPLICATION_CONSTANTS;

const connectionString = `mongodb://${
  process.env.MONGODB_USERNAME
}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@${
  process.env.MONGODB_URL
}`;
const connectionDatabase = `${process.env.MONGODB_DB_NAME}`;

const CONNECT_TIMEOUT_MS =
  process.env.NODE_ENV === "production" ? 15_000 : 5_000;

export const connectToDatabase = async (): Promise<DBConnect> => {
  let client: MongoClient;
  let db: Db;
  try {
    const connectPromise = MongoClient.connect(connectionString, {
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS + 2000, // driver timeout slightly after ours
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Connection timed out")),
        CONNECT_TIMEOUT_MS,
      ),
    );
    connectPromise.catch(() => {}); // absorb driver rejection when it eventually fails
    client = await Promise.race([connectPromise, timeoutPromise]);
  } catch (error) {
    return {
      error: true,
      error_message: `${AC.DB_CLIENT_ERROR}\n${error}`,
    };
  }

  try {
    db = client.db(connectionDatabase);
    return {
      client,
      db,
      mongo_connected: true,
    };
  } catch (error) {
    return {
      error: true,
      error_message: `${AC.DB_COLLECTION_ERROR}\n${error}`,
    };
  }
};

export const dbConnect = async (): Promise<DBConnect> => {
  try {
    const connection = await connectToDatabase();
    if (connection.error) {
      return {
        error: true,
        error_message: connection.error_message,
      };
    }
    if (connection.error === undefined) {
      return {
        client: connection.client,
        db: connection.db,
        mongo_connected: connection.mongo_connected,
      };
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return {
      error: true,
      error_message: errMessage,
    };
  }
  return {
    error: true,
    error_message: `${AC.DB_CONNECT_ERROR}`,
  };
};
