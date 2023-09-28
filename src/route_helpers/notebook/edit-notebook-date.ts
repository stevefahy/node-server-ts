import { errString } from "../../util/errorString";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { dbConnect } from "../../util/db_connect";
import { ObjectId as MObjectId } from "mongodb";
import { NotebookDateUpdated } from "../../types";
import { UpdateResult, Document } from "mongodb";

const AC = APPLICATION_CONSTANTS;

export const editNotebookDate = async (
  user_ID: string,
  notebook_ID: string,
  notebookUpdated: string
) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }
  if (!notebookUpdated || notebookUpdated === undefined) {
    throw new Error(`${AC.NOTEBOOK_UPDATED_DATE_MISSING}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);

  let nbUpdated: Date;
  if (notebookUpdated === undefined) {
    nbUpdated = new Date();
  } else {
    nbUpdated = new Date(notebookUpdated);
  }

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const editNotebookDate = async (
    uID: MObjectId,
    nbID: MObjectId,
    nbUpated: Date
  ): Promise<UpdateResult<Document>> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
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
                "notebooks.$.updatedAt": nbUpated,
              },
            }
          )
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTEBOOK_UPDATED_DATE_ERROR}`);
              } else {
                if (res.modifiedCount > 0 || res.matchedCount > 0) {
                  resolve(res);
                } else {
                  reject(`${AC.NOTEBOOK_UPDATED_DATE_ERROR}`);
                }
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
    const result = (await editNotebookDate(
      userID,
      notebookID,
      nbUpdated
    )) as NotebookDateUpdated;
    result._id = notebookID;
    result.updatedAt = nbUpdated;
    return { success: true, notebook_date_updated: result };
  } catch (err: unknown) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
