import { Notebook } from "../../types";
import { getNativeDb } from "../../util/db_connect";
import {
  ObjectId as MObjectId,
  UpdateResult,
  Document,
  BulkWriteResult,
} from "mongodb";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";

const AC = APPLICATION_CONSTANTS;

export const moveNotes = async (
  user_ID: string,
  notes: string[],
  notebook_ID: string,
  latestUpdatedNote: string
) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }
  if (!notes || notes === undefined || notes.length < 1) {
    throw new Error(`${AC.NOTES_MOVE_MISSING}`);
  }
  if (!latestUpdatedNote || latestUpdatedNote === undefined) {
    throw new Error(`${AC.NOTEBOOK_UPDATED_DATE_MISSING}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);
  const destination_notebookID: MObjectId = new MObjectId(notebook_ID);

  const notesObjectArray: MObjectId[] = [];
  for (let i = 0, length = notes.length; i < length; i++) {
    notesObjectArray.push(new MObjectId(notes[i]));
  }

  const db = await getNativeDb();

  const getNotebook = (uID: MObjectId, nbId: MObjectId): Promise<Document> => {
    return new Promise((resolve, reject) => {
      try {
        db
          .collection<Notebook>("notebooks")
          .aggregate([
            {
              $match: {
                user: uID,
              },
            },
            {
              $unwind: "$notebooks",
            },
            {
              $match: {
                "notebooks._id": nbId,
              },
            },
            {
              $replaceRoot: {
                newRoot: "$notebooks",
              },
            },
          ])
          .next()
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTEBOOK_ERROR}`);
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
        reject(`${err}`);
      }
    });
  };

  const updateNotebook = (
    uID: MObjectId,
    nbID: MObjectId,
    date: Date
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
                "notebooks.$.updatedAt": date,
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
        if (err instanceof Error) {
          reject(`${AC.NOTEBOOK_UPDATE_ERROR}\n${err}`);
        }
        return;
      }
    });
  };

  const moveNotes = (
    uID: MObjectId,
    destination_nbID: MObjectId,
    notes: MObjectId[]
  ): Promise<BulkWriteResult> => {
    const bulk_array = notes.map((note) => {
      return {
        updateOne: {
          filter: { _id: note, user: uID },
          update: { $set: { notebook: destination_nbID } },
        },
      };
    });
    return new Promise((resolve, reject) => {
      try {
        db
          .collection("notes")
          .bulkWrite(bulk_array)
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTES_MOVE_ERROR}`);
              } else if (!res.ok) {
                reject(`${AC.NOTES_MOVE_ERROR}`);
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

  let notebook: Notebook;
  try {
    notebook = (await getNotebook(userID, destination_notebookID)) as Notebook;
  } catch (err) {
    throw new Error(`${err}`);
  }

  if (
    notebook.updatedAt &&
    new Date(notebook.updatedAt) < new Date(latestUpdatedNote)
  ) {
    try {
      await updateNotebook(userID, notebookID, new Date(latestUpdatedNote));
    } catch (error: unknown) {
      throw new Error(`${AC.NOTEBOOK_UPDATE_ERROR}\n${error}`);
    }
  }

  try {
    const result = await moveNotes(
      userID,
      destination_notebookID,
      notesObjectArray
    );
    return { success: true, notes_moved: notes, server_response: result };
  } catch (err: unknown) {
    throw new Error(`${err}`);
  }
};
