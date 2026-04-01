import { Note } from "../../types";
import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { getNativeDb } from "../../util/db_connect";
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

  const db = await getNativeDb();

  try {
    const docs: WithId<Document>[] = await db
      .collection("notes")
      .find({ user: userID, notebook: notebookID })
      .toArray();

    const mapped: Note[] = docs.map((item) => {
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
        note: item.note as string,
        createdAt: createddate,
        updatedAt: updateddate,
      };
    });

    return { success: true, notes: mapped };
  } catch (err) {
    throw new Error(`${err}`);
  }
};
