import { Document, ObjectId as MObjectId } from "mongodb";
import { Notebook } from "../../types";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { getNativeDb } from "../../util/db_connect";

const AC = APPLICATION_CONSTANTS;

export const getNotebook = async (user_ID: string, notebook_ID: string) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);

  const db = await getNativeDb();

  const findNotebook = (
    userID: MObjectId,
    notebookID: MObjectId
  ): Promise<Document | null> => {
    return new Promise((resolve, reject) => {
      try {
        db
          .collection("notebooks")
          .aggregate([
            {
              $match: {
                user: userID,
              },
            },
            {
              $unwind: "$notebooks",
            },
            {
              $match: {
                "notebooks._id": notebookID,
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
      } catch (error) {
        reject(error);
      }
    });
  };

  try {
    const result = (await findNotebook(userID, notebookID)) as Notebook | null;
    if (result) {
      // Convert the ObjectId's to string so that they can be parsed by props
      result._id = result._id.toString();
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
    return { success: true, notebook: result };
  } catch (err) {
    throw new Error(`${err}`);
  }
};
