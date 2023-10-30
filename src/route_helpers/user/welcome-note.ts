import { ObjectId as MObjectId, InsertOneResult, Document } from "mongodb";
import { errString } from "../../util/errorString";
import { dbConnect } from "../../util/db_connect";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import path from "path";

const AC = APPLICATION_CONSTANTS;

const getWelcomeNote = async (framework: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    let dirPath;
    if (framework === "angular") {
      dirPath = path.join(
        __dirname,
        "../../application_constants/welcome_markdown_angular.md"
      );
    } else {
      dirPath = path.join(
        __dirname,
        "../../application_constants/welcome_markdown.md"
      );
    }
    let welcome_note: string;
    try {
      welcome_note = readFileSync(dirPath, "utf8");
      resolve(welcome_note);
    } catch (err: unknown) {
      reject(err);
    }
  });
};

let WELCOME_NOTE: string;

export const createWelcomeNote = async (user_ID: string, framework: string) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }

  WELCOME_NOTE = await getWelcomeNote(framework);

  const userID = new MObjectId(user_ID);
  const notebookID = new mongoose.Types.ObjectId();

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const createNotebook = async (
    user_id: MObjectId,
    notebook_id: MObjectId
  ): Promise<InsertOneResult<Document>> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
          .collection("notebooks")
          .insertOne({
            user: user_id,
            notebooks: [
              {
                _id: notebook_id,
                notebook_name: "Welcome",
                notebook_cover: "default",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          })
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTEBOOK_CREATE_ERROR}`);
              } else {
                resolve(res);
              }
            },
            (err) => {
              if (err) {
                reject(err);
              }
            }
          );
      } catch (err: unknown) {
        reject(err);
      }
    });
  };

  const createNote = async (
    user_id: MObjectId,
    notebook_id: MObjectId,
    note: string
  ): Promise<InsertOneResult<Document>> => {
    return new Promise((resolve, reject) => {
      try {
        return db_connection.db
          .collection("notes")
          .insertOne({
            notebook: notebook_id,
            user: user_id,
            note: note,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.CREATE_NOTE_ERROR}`);
              } else {
                resolve(res);
              }
            },
            (err: unknown) => {
              if (err) {
                reject(err);
              }
            }
          );
      } catch (err: unknown) {
        reject(err);
      }
    });
  };

  try {
    await createNotebook(userID, notebookID);
  } catch (err) {
    throw new Error(`${err}`);
  }

  try {
    const result_n = await createNote(userID, notebookID, WELCOME_NOTE);
    return {
      success: true,
      data: { notebookID: notebookID, noteID: result_n.insertedId },
    };
  } catch (err: unknown) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
