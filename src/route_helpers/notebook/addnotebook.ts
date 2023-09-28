import { errString } from "../../util/errorString";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { dbConnect } from "../../util/db_connect";
import { ObjectId as MObjectId, UpdateResult, Document } from "mongodb";
import { Notebook } from "../../types";

const AC = APPLICATION_CONSTANTS;

export const addNotebook = async (
  user_ID: string,
  notebook_name: string,
  notebook_cover: string
) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }
  if (!notebook_name || notebook_name === undefined) {
    throw new Error(`${AC.NOTEBOOK_NAME_ERROR}`);
  }
  if (!notebook_cover || notebook_cover === undefined) {
    throw new Error(`${AC.NOTEBOOK_COVER_ERROR}`);
  }

  const userID = new MObjectId(user_ID);

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const getAdded = (
    user_id: MObjectId,
    notebook_id: MObjectId
  ): Promise<Document | null> => {
    return new Promise((resolve, reject) => {
      db_connection.db
        .collection("notebooks")
        .aggregate([
          {
            $match: {
              user: user_id,
            },
          },
          {
            $unwind: "$notebooks",
          },
          {
            $match: {
              "notebooks._id": notebook_id,
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
    });
  };

  const addNotebook = async (
    user_id: MObjectId,
    notebook_id: MObjectId,
    nb_name: string,
    nb_cover: string
  ): Promise<UpdateResult<Document>> => {
    return new Promise((resolve, reject) => {
      db_connection.db
        .collection("notebooks")
        .updateOne(
          { user: user_id },
          {
            $push: {
              notebooks: {
                _id: notebook_id,
                notebook_name: nb_name,
                notebook_cover: nb_cover,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          }
        )
        .then(
          (res) => {
            if (res === null) {
              reject(`${AC.NOTEBOOK_CREATE_ERROR}`);
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
    });
  };

  let result_add: UpdateResult<Document>;
  const objectId = new MObjectId();
  try {
    result_add = await addNotebook(
      userID,
      objectId,
      notebook_name,
      notebook_cover
    );
  } catch (err) {
    throw new Error(`${err}`);
  }

  if (result_add.modifiedCount < 1) {
    throw new Error(`${AC.NOTEBOOK_CREATE_ERROR}`);
  }

  try {
    const result_added = (await getAdded(
      userID,
      objectId
    )) as unknown as Notebook;
    if (!result_added || result_added === null) {
      throw new Error(`${AC.NOTEBOOK_CREATE_ERROR}`);
    }
    return { success: true, notebook: result_added };
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
