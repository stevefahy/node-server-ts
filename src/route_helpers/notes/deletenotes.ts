import { errString } from "../../util/errorString";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { dbConnect } from "../../util/db_connect";
import { DeleteResult, ObjectId as MObjectId } from "mongodb";

const AC = APPLICATION_CONSTANTS;

export const deleteNotes = async (user_ID: string, note_ids: []) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!note_ids || note_ids === undefined || note_ids.length < 1) {
    throw new Error(`${AC.NOTES_DELETE_ID_ERROR}`);
  }

  const userID = new MObjectId(user_ID);

  const notesArray = [];
  for (let i = 0, length = note_ids.length; i < length; i++) {
    notesArray.push(new MObjectId(note_ids[i]));
  }

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const removeNotes = (
    user_id: MObjectId,
    notes: MObjectId[]
  ): Promise<DeleteResult> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
          .collection("notes")
          .deleteMany({ user: user_id, _id: { $in: notes } })
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTES_DELETE_ERROR}`);
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
      } catch (err) {
        reject(err);
      }
    });
  };

  try {
    const result = await removeNotes(userID, notesArray);
    return { success: true, notes_deleted: result };
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
