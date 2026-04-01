import { ObjectId as MObjectId, WithId, Document } from "mongodb";
import { Notebooks, Notebook } from "../../types";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { getNativeDb } from "../../util/db_connect";

const AC = APPLICATION_CONSTANTS;

export const getNotebooks = async (user_ID: string) => {
  if (!user_ID || user_ID === undefined) {
    throw new Error(`${AC.UNAUTHORIZED_USER}`);
  }

  const userID = new MObjectId(user_ID);

  const db = await getNativeDb();

  const findNotebooks = (
    userID: MObjectId
  ): Promise<WithId<Document> | null> => {
    return new Promise((resolve, reject) => {
      try {
        db
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
      const noteCounts = await db
        .collection("notes")
        .aggregate([
          { $match: { user: userID } },
          { $group: { _id: "$notebook", count: { $sum: 1 } } },
        ])
        .toArray();

      const countMap = new Map(
        noteCounts.map((c) => [c._id.toString(), c.count]),
      );

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
          noteCount: countMap.get(item._id) ?? 0,
        };
      });
    } else {
      throw new Error(`${AC.NOTEBOOKS_NOT_FOUND}`);
    }
    return { success: true, notebooks: result.notebooks };
  } catch (err) {
    throw new Error(`${err}`);
  }
};
