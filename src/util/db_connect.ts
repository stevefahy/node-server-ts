import { Db, MongoClient } from "mongodb";
import APPLICATION_CONSTANTS from "../application_constants/applicationConstants";

const AC = APPLICATION_CONSTANTS;

const connectionString = `mongodb://${
  process.env.MONGODB_USERNAME
}:${encodeURIComponent(process.env.MONGODB_PASSWORD ?? "")}@${
  process.env.MONGODB_URL
}`;

const connectionDatabase = `${process.env.MONGODB_DB_NAME}`;

const CONNECT_TIMEOUT_MS =
  process.env.NODE_ENV === "production" ? 15_000 : 5_000;

let client: MongoClient | undefined;
let connecting: Promise<MongoClient> | undefined;

async function connectClient(): Promise<MongoClient> {
  const connectPromise = MongoClient.connect(connectionString, {
    serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS + 2000,
  });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("Connection timed out")),
      CONNECT_TIMEOUT_MS,
    ),
  );
  connectPromise.catch(() => {});
  return Promise.race([connectPromise, timeoutPromise]);
}

/**
 * Shared MongoDB database handle for native driver operations (notebooks/notes).
 * Reuses one client per process; do not call close per request.
 */
export async function getNativeDb(): Promise<Db> {
  if (client) {
    return client.db(connectionDatabase);
  }
  if (!connecting) {
    connecting = (async () => {
      try {
        const c = await connectClient();
        client = c;
        return c;
      } catch (e) {
        throw new Error(
          `${AC.DB_CLIENT_ERROR}\n${e instanceof Error ? e.message : String(e)}`,
        );
      } finally {
        connecting = undefined;
      }
    })();
  }
  try {
    const c = await connecting;
    return c.db(connectionDatabase);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${message}`);
  }
}

/** For graceful shutdown (optional). */
export async function closeNativeMongoClient(): Promise<void> {
  if (!client) return;
  try {
    await client.close();
  } finally {
    client = undefined;
  }
}
