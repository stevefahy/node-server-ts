import { ObjectId as MObjectId, UpdateResult } from "mongodb";
import { getNativeDb } from "../../util/db_connect";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";

const AC = APPLICATION_CONSTANTS;

export const saveNote = async (
  user_ID: string,
  notebook_ID: string,
  note_ID: string,
  note: string
) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }
  if (!note_ID || note_ID === undefined) {
    throw new Error(`${AC.NOTE_ID_ERROR}`);
  }
  if (!note || note === undefined) {
    throw new Error(`${AC.NOTE_EMPTY}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);
  const noteID = new MObjectId(note_ID);

  const db = await getNativeDb();

  const updateNotebook = (
    uID: MObjectId,
    nbID: MObjectId
  ): Promise<UpdateResult> => {
    return new Promise((resolve, reject) => {
      try {
        db
          .collection("notebooks")
          .updateOne(
            {
              user: uID,
              notebooks: {
                $elemMatch: {
                  _id: nbID,
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
                reject(err);
              }
            }
          );
      } catch (err) {
        reject(err);
      }
    });
  };

  const saveNote = (
    uID: MObjectId,
    nbID: MObjectId,
    nID: MObjectId,
    n: string
  ): Promise<UpdateResult> => {
    return new Promise((resolve, reject) => {
      try {
        db
          .collection("notes")
          .updateOne(
            {
              _id: nID,
              user: uID,
              notebook: nbID,
            },
            {
              $set: {
                note: n,
                updatedAt: new Date(),
              },
            }
          )
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTE_SAVE_ERROR}`);
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
    await updateNotebook(userID, notebookID);
  } catch (err: unknown) {
    throw new Error(`${AC.NOTEBOOK_UPDATE_ERROR}\n${err}`);
  }

  try {
    const result = await saveNote(userID, notebookID, noteID, note);
    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      throw new Error(`${AC.NOTE_SAVE_ERROR}`);
    }
    return {
      success: true,
      server_response: result,
    };
  } catch (err: unknown) {
    throw new Error(`${err}`);
  }
};
