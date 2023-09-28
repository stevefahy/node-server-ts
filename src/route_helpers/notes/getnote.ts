import { Note } from "../../types";
import { errString } from "../../util/errorString";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { dbConnect } from "../../util/db_connect";
import { Document, ObjectId as MObjectId } from "mongodb";

const AC = APPLICATION_CONSTANTS;

export const getNote = async (user_ID: string, note_ID: string) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!note_ID || note_ID === undefined) {
    throw new Error(`${AC.NOTE_ID_ERROR}`);
  }

  const userID = new MObjectId(user_ID);
  const noteID = new MObjectId(note_ID);

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const findNote = (
    user_id: MObjectId,
    note_id: MObjectId
  ): Promise<Document | null> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
          .collection("notes")
          .find({ user: user_id, _id: note_id })
          .project({ user: 0 })
          .next()
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTE_ERROR}`);
              } else {
                resolve(res);
              }
            },
            (err) => {
              if (err) {
                reject(`${AC.NOTE_ERROR} ${err}`);
              }
            }
          );
      } catch (err) {
        throw new Error(`${AC.NOTE_ERROR} ${err}`);
      }
    });
  };

  try {
    const result = (await findNote(userID, noteID)) as Note;
    if (result) {
      result._id = result._id.toString();
      result.notebook = result.notebook.toString();
      let createddate = "No date";
      let updateddate = "No date";
      if (result.createdAt) {
        createddate = result.createdAt?.toString();
      }
      if (result.updatedAt) {
        updateddate = result.updatedAt?.toString();
      }
      result.createdAt = createddate;
      result.updatedAt = updateddate;
    }
    return { success: true, note: result };
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
