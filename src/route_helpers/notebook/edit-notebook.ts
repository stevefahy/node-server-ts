import { ObjectId as MObjectId, UpdateResult } from "mongodb";
import { getNativeDb } from "../../util/db_connect";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { NotebookCoverType } from "../../types";

const AC = APPLICATION_CONSTANTS;

export const editNotebook = async (
  user_ID: string,
  notebook_ID: string,
  notebook_Name: string,
  notebook_Cover: NotebookCoverType,
  notebook_Updated: string
) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_ID || notebook_ID === undefined) {
    throw new Error(`${AC.NOTEBOOK_ID_ERROR}`);
  }
  if (!notebook_Name || notebook_Name === undefined) {
    throw new Error(`${AC.NOTEBOOK_NAME_ERROR}`);
  }
  if (!notebook_Cover || notebook_Cover === undefined) {
    throw new Error(`${AC.NOTEBOOK_COVER_ERROR}`);
  }
  if (!notebook_Updated || notebook_Updated === undefined) {
    throw new Error(`${AC.NOTEBOOK_UPDATED_DATE_MISSING}`);
  }

  const userID = new MObjectId(user_ID);
  const notebookID = new MObjectId(notebook_ID);

  let nbUpdated: Date;
  if (notebook_Updated === undefined) {
    nbUpdated = new Date();
  } else {
    nbUpdated = new Date(notebook_Updated);
  }

  const db = await getNativeDb();

  const updateNotebook = (
    userID: MObjectId,
    notebookID: MObjectId,
    nb_name: string,
    nb_cover: string,
    nb_updated: Date
  ): Promise<UpdateResult> => {
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
              $set: {
                "notebooks.$.notebook_name": nb_name,
                "notebooks.$.notebook_cover": nb_cover,
                "notebooks.$.updatedAt": nb_updated,
              },
            }
          )
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTEBOOK_EDIT_ERROR}`);
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
    const result = (await updateNotebook(
      userID,
      notebookID,
      notebook_Name,
      notebook_Cover,
      nbUpdated
    )) as UpdateResult;
    if (result.modifiedCount > 0) {
      const edited_notebook = {
        _id: notebookID,
        notebook_name: notebook_Name,
        notebook_cover: notebook_Cover,
      };
      return { success: true, notebook_edited: edited_notebook };
    } else {
      throw new Error(`${AC.NOTEBOOK_EDIT_ERROR}`);
    }
  } catch (err) {
    throw new Error(`${err}`);
  }
};
