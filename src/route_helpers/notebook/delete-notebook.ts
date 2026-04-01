import { ObjectId as MObjectId, UpdateResult, Document } from "mongodb";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { getNativeDb } from "../../util/db_connect";

const AC = APPLICATION_CONSTANTS;

export const deleteNotebook = async (user_ID: string, notebook_ID: string) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);

  const db = await getNativeDb();

  const deleteNotebook = (
    userID: MObjectId,
    notebookID: MObjectId
  ): Promise<UpdateResult<Document>> => {
    return new Promise((resolve, reject) => {
      try {
        db
          .collection("notebooks")
          .updateOne(
            {
              user: userID,
              notebooks: {
                $elemMatch: {
                  _id: notebookID,
                },
              },
            },
            {
              $pull: {
                notebooks: {
                  _id: notebookID,
                },
              },
            }
          )
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTEBOOK_DELETE_ERROR}`);
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
    const result = await deleteNotebook(userID, notebookID);
    return {
      success: true,
      notebook_deleted: notebookID,
      server_response: result,
    };
  } catch (err: unknown) {
    throw new Error(`${err}`);
  }
};
