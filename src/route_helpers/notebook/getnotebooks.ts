import { ObjectId as MObjectId, WithId, Document } from "mongodb";
import { Notebooks, Notebook } from "../../types";
import { errString } from "../../util/errorString";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { dbConnect } from "../../util/db_connect";

const AC = APPLICATION_CONSTANTS;

export const getNotebooks = async (user_ID: string) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }

  const userID = new MObjectId(user_ID);

  const db_connection = await dbConnect();

  if (db_connection.error !== undefined) {
    const errMessage = errString(db_connection.error_message);
    throw new Error(`${AC.DB_CONNECT_ERROR}\n${errMessage}`);
  }

  const findNotebooks = (
    userID: MObjectId
  ): Promise<WithId<Document> | null> => {
    return new Promise((resolve, reject) => {
      try {
        db_connection.db
          .collection("notebooks")
          .findOne({ user: userID })
          .then(
            (res) => {
              if (res === null) {
                reject(`${AC.NOTEBOOKS_DB_ERROR}`);
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
    const result = (await findNotebooks(userID)) as Notebooks | null;
    if (result && result.notebooks) {
      result.notebooks = result.notebooks.map((item: Notebook) => {
        item._id = item._id.toString();
        let createddate = "No date";
        let updateddate = "No date";
        if (item.createdAt) {
          createddate = item.createdAt?.toString();
        }
        if (item.updatedAt) {
          updateddate = item.updatedAt?.toString();
        }
        return {
          _id: item._id,
          notebook_name: item.notebook_name,
          notebook_cover: item.notebook_cover,
          createdAt: createddate,
          updatedAt: updateddate,
        };
      });
    } else {
      throw new Error(`${AC.NOTEBOOKS_NOT_FOUND}`);
    }
    return { success: true, notebooks: result.notebooks };
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    if (db_connection.mongo_connected) {
      db_connection.client.close();
    }
  }
};
