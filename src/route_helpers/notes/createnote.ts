import { errString } from "../../util/errorString";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { dbConnect } from "../../util/db_connect";
import {
  ObjectId as MObjectId,
  UpdateResult,
  Document,
  InsertOneResult,
} from "mongodb";

const AC = APPLICATION_CONSTANTS;

export const createNote = async (
  user_ID: string,
  notebook_ID: string,
  note: string
) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }
  if (!note || note.length === 0) {
    throw new Error(`${AC.NOTE_EMPTY}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const updateNotebook = (
    user_id: MObjectId,
    notebook_id: MObjectId
  ): Promise<UpdateResult<Document>> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
          .collection("notebooks")
          .updateOne(
            {
              user: user_id,
              notebooks: {
                $elemMatch: {
                  _id: notebook_id,
                },
              },
            },
            {
              $set: {
                "notebooks.$.updatedAt": new Date(),
              },
            }
          )
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTEBOOK_UPDATE_ERROR}`);
              } else {
                resolve(res);
              }
            },
            (err) => {
              if (err) {
                reject(`${AC.NOTEBOOK_UPDATE_ERROR}\n${err}`);
              }
            }
          );
      } catch (error) {
        reject(`${AC.NOTEBOOK_UPDATE_ERROR}\n${error}`);
      }
    });
  };

  const insertNote = (
    userID: MObjectId,
    notebookID: MObjectId,
    note: string
  ): Promise<InsertOneResult<Document>> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
          .collection("notes")
          .insertOne({
            notebook: notebookID,
            user: userID,
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
            (err) => {
              if (err) {
                reject(`${AC.CREATE_NOTE_ERROR}\n${err}`);
              }
            }
          );
      } catch (err) {
        reject(`${AC.CREATE_NOTE_ERROR}\n${err}`);
      }
    });
  };

  try {
    (await updateNotebook(userID, notebookID)) as UpdateResult;
  } catch (err) {
    throw new Error(`${err}`);
  }

  try {
    const result = await insertNote(userID, notebookID, note);
    return { success: true, note: result };
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
