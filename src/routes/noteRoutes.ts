import express, { Request, Response } from "express";
import { verifyUser } from "../authenticate";
import { requireAuth } from "../middleware/requireAuth";
import { getNote } from "../route_helpers/notes/getnote";
import { getNotes } from "../route_helpers/notes/getnotes";
import { createNote } from "../route_helpers/notes/createnote";
import { deleteNotes } from "../route_helpers/notes/deletenotes";
import { moveNotes } from "../route_helpers/notes/movenotes";
import { saveNote } from "../route_helpers/notes/save-note";
import { getNotebook } from "../route_helpers/notebook/getnotebook";
import { getNotebooks } from "../route_helpers/notebook/getnotebooks";
import { addNotebook } from "../route_helpers/notebook/addnotebook";
import { editNotebookDate } from "../route_helpers/notebook/edit-notebook-date";
import { deleteNotebook } from "../route_helpers/notebook/delete-notebook";
import { editNotebook } from "../route_helpers/notebook/edit-notebook";
import APPLICATION_CONSTANTS from "../application_constants/applicationConstants";

const router = express.Router();

const AC = APPLICATION_CONSTANTS;

const withUser = [verifyUser, requireAuth];

router.get("/notebooks", ...withUser, async (req: Request, res: Response) => {
  try {
    const response = await getNotebooks(req.user!._id);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("getNotebooks error:", err);
    res.status(400).send({ error: AC.NOTEBOOKS_ERROR });
    return;
  }
});

router.get("/notebook/:notebookId", ...withUser, async (req, res) => {
  if (!req.params.notebookId) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }

  try {
    const response = await getNotebook(req.user!._id, req.params.notebookId);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("getNotebook error:", err);
    res.status(400).send({ error: AC.NOTEBOOK_ERROR });
    return;
  }
});

router.get("/notes/:notebookId", ...withUser, async (req, res) => {
  if (!req.params.notebookId) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }
  try {
    const response = await getNotes(req.user!._id, req.params.notebookId);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("getNotes error:", err);
    res.status(400).send({ error: AC.NOTES_FETCH_ERROR });
    return;
  }
});

router.get("/notebook/:notebookId/:noteId", ...withUser, async (req, res) => {
  if (!req.params.notebookId) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }
  if (!req.params.noteId) {
    res.status(400).send({ error: AC.NOTE_ID_ERROR });
    return;
  }

  if (req.params.noteId === "create-note") {
    res.status(200).send({ createMode: true });
    return;
  }

  try {
    const response = await getNote(req.user!._id, req.params.noteId);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("getNote error:", err);
    res.status(400).send({ error: AC.NOTE_ERROR });
    return;
  }
});

router.post("/create-note", ...withUser, async (req, res) => {
  const data = req.body;
  const { notebookId, note } = data;

  if (!notebookId) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }
  if (!note) {
    res.status(400).send({ error: AC.NOTE_EMPTY });
    return;
  }

  try {
    const response = await createNote(req.user!._id, notebookId, note);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("createNote error:", err);
    res.status(400).send({ error: AC.CREATE_NOTE_ERROR });
    return;
  }
});

router.post("/addnotebook", ...withUser, async (req, res) => {
  const data = req.body;
  const { notebookName, notebookCover } = data;

  if (!notebookName) {
    res.status(400).send({ error: AC.NOTEBOOK_NAME_ERROR });
    return;
  }
  if (!notebookCover) {
    res.status(400).send({ error: AC.NOTEBOOK_COVER_ERROR });
    return;
  }

  try {
    const response = await addNotebook(
      req.user!._id,
      notebookName,
      notebookCover,
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("addNotebook error:", err);
    res.status(400).send({ error: AC.NOTEBOOK_CREATE_ERROR });
    return;
  }
});

router.post("/delete-notes", ...withUser, async (req, res) => {
  const data = req.body;
  const { note_ids } = data;

  if (!note_ids || note_ids.length < 1) {
    res.status(400).send({ error: AC.NOTES_DELETE_ID_ERROR });
    return;
  }

  try {
    const response = await deleteNotes(req.user!._id, note_ids);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("deleteNotes error:", err);
    res.status(400).send({ error: AC.NOTES_DELETE_ERROR });
    return;
  }
});

router.post("/edit-notebook-date", ...withUser, async (req, res) => {
  const data = req.body;
  const { notebookID, notebookUpdated } = data;

  if (!notebookID) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }
  if (!notebookUpdated) {
    res.status(400).send({ error: AC.NOTEBOOK_UPDATED_DATE_MISSING });
    return;
  }

  try {
    const response = await editNotebookDate(
      req.user!._id,
      notebookID,
      notebookUpdated,
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("editNotebookDate error:", err);
    res.status(400).send({ error: AC.NOTEBOOK_UPDATED_DATE_ERROR });
    return;
  }
});

router.post("/move-notes", ...withUser, async (req, res) => {
  const data = req.body;
  const { notes, notebookID, latestUpdatedNote } = data;

  if (!notes) {
    res.status(400).send({ error: AC.NOTES_MOVE_MISSING });
    return;
  }
  if (!notebookID) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }
  if (!latestUpdatedNote) {
    res.status(400).send({ error: AC.NOTEBOOK_UPDATED_DATE_MISSING });
    return;
  }

  try {
    const response = await moveNotes(
      req.user!._id,
      notes,
      notebookID,
      latestUpdatedNote,
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("moveNotes error:", err);
    res.status(400).send({ error: AC.NOTES_MOVE_ERROR });
    return;
  }
});

router.post("/delete-notebook", ...withUser, async (req, res) => {
  const data = req.body;
  const { notebookID } = data;

  if (!notebookID) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }

  try {
    const response = await deleteNotebook(req.user!._id, notebookID);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("deleteNotebook error:", err);
    res.status(400).send({ error: AC.NOTEBOOK_DELETE_ERROR });
    return;
  }
});

router.post("/edit-notebook", ...withUser, async (req, res) => {
  const data = req.body;
  const { notebookID, notebookName, notebookCover, notebookUpdated } = data;

  if (!notebookID) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }
  if (!notebookName) {
    res.status(400).send({ error: AC.NOTEBOOK_NAME_ERROR });
    return;
  }
  if (!notebookCover) {
    res.status(400).send({ error: AC.NOTEBOOK_COVER_ERROR });
    return;
  }
  if (!notebookUpdated) {
    res.status(400).send({ error: AC.NOTEBOOK_UPDATED_DATE_MISSING });
    return;
  }

  try {
    const response = await editNotebook(
      req.user!._id,
      notebookID,
      notebookName,
      notebookCover,
      notebookUpdated,
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("editNotebook error:", err);
    res.status(400).send({ error: AC.NOTEBOOK_EDIT_ERROR });
    return;
  }
});

router.post("/save-note", ...withUser, async (req, res) => {
  const data = req.body;
  const { notebookID, noteID, note } = data;

  if (!notebookID) {
    res.status(400).send({ error: AC.NOTEBOOK_ID_ERROR });
    return;
  }
  if (!noteID) {
    res.status(400).send({ error: AC.NOTE_ID_ERROR });
    return;
  }
  if (!note) {
    res.status(400).send({ error: AC.NOTE_EMPTY });
    return;
  }

  try {
    const response = await saveNote(req.user!._id, notebookID, noteID, note);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    console.error("saveNote error:", err);
    res.status(400).send({ error: AC.NOTE_SAVE_ERROR });
    return;
  }
});

export const noteRouter = router;
