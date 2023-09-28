import { Notes } from "../../types";
import { errString } from "../../util/errorString";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { dbConnect } from "../../util/db_connect";
import { ObjectId as MObjectId, WithId, Document } from "mongodb";

const AC = APPLICATION_CONSTANTS;

export const getNotes = async (user_ID: string, notebook_ID: string) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const findNotes = (
    user_id: MObjectId,
    notebook_id: MObjectId
  ): Promise<WithId<Document>[]> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
          .collection("notes")
          .find({ user: user_id, notebook: notebook_id })
          .toArray()
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTES_NOT_FOUND}`);
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
      } catch (err) {
        reject(err);
      }
    });
  };

  try {
    const result: Notes = (await findNotes(
      userID,
      notebookID
    )) as unknown as Notes;
    if (result && result.notes) {
      // Convert the ObjectId's to string so that they can be parsed by props
      result.notes = result.notes.map((item) => {
        let createddate = "No date";
        let updateddate = "No date";
        if (item.createdAt) {
          createddate = item.createdAt?.toString();
        }
        if (item.updatedAt) {
          updateddate = item.updatedAt?.toString();
        }
        return {
          _id: item._id.toString(),
          notebook: item.notebook.toString(),
          note: item.note,
          createdAt: createddate,
          updatedAt: updateddate,
        };
      });
    }
    return { success: true, notes: result };
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
