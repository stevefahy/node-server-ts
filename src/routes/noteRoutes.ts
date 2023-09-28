import express, { Request, Response } from "express";
const router = express.Router();
import { verifyUser } from "../authenticate";
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
import { errString } from "../util/errorString";

const AC = APPLICATION_CONSTANTS;

// ------------------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------------------

router.get(
  "/notebooks",
  verifyUser,
  async function (req: Request, res: Response) {
    if (!req.user) {
      res.statusCode = 401;
      res.send({ error: `${AC.NOTEBOOKS_ERROR} ${AC.UNAUTHORIZED_USER}` });
      return;
    }

    try {
      const response = await getNotebooks(req.user._id);
      if (response) {
        res.send(response);
        return;
      }
    } catch (err: unknown) {
      const errMessage = errString(err);
      res.statusCode = 400;
      res.send({ error: `${AC.NOTEBOOKS_ERROR}\n${errMessage}` });
      return;
    }
  }
);

router.get("/notebook/:notebookId", verifyUser, async function (req, res) {
  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_ERROR} ${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!req.params.notebookId) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }

  try {
    const response = await getNotebook(req.user._id, req.params.notebookId);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_ERROR}\n${errMessage}` });
    return;
  }
});

router.get("/notes/:notebookId", verifyUser, async function (req, res) {
  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTES_FETCH_ERROR} ${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!req.params.notebookId) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }
  try {
    const response = await getNotes(req.user._id, req.params.notebookId);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTES_FETCH_ERROR}\n${errMessage}` });
    return;
  }
});

router.get(
  "/notebook/:notebookId/:noteId",
  verifyUser,
  async function (req, res) {
    if (!req.user) {
      res.statusCode = 401;
      res.send({ error: `${AC.NOTES_FETCH_ERROR} ${AC.UNAUTHORIZED_USER}` });
      return;
    }
    if (!req.params.notebookId) {
      res.statusCode = 400;
      res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
      return;
    }
    if (!req.params.noteId) {
      res.statusCode = 400;
      res.send({ error: `${AC.NOTE_ID_ERROR}` });
      return;
    }

    if (req.params.noteId === "create-note") {
      return;
    }

    try {
      const response = await getNote(req.user._id, req.params.noteId);
      if (response) {
        res.send(response);
        return;
      }
    } catch (err: unknown) {
      const errMessage = errString(err);
      res.statusCode = 400;
      res.send({ error: `${AC.NOTES_FETCH_ERROR}\n${errMessage}` });
      return;
    }
  }
);

router.post("/create-note", verifyUser, async function (req, res) {
  const data = req.body;
  const { notebookId, note } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.CREATE_NOTE_ERROR}\n${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!notebookId) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }
  if (!note) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTE_EMPTY}` });
    return;
  }

  try {
    const response = await createNote(req.user._id, notebookId, note);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.CREATE_NOTE_ERROR}\n${errMessage}` });
    return;
  }
});

router.post("/addnotebook", verifyUser, async function (req, res) {
  const data = req.body;
  const { notebookName, notebookCover } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_CREATE_ERROR}\n${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!notebookName || notebookName === null) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_NAME_ERROR}` });
    return;
  }
  if (!notebookCover || notebookCover === null) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_COVER_ERROR}` });
    return;
  }

  try {
    const response = await addNotebook(
      req.user._id,
      notebookName,
      notebookCover
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_CREATE_ERROR}\n${errMessage}` });
    return;
  }
});

router.post("/delete-notes", verifyUser, async function (req, res) {
  const data = req.body;
  const { note_ids } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTES_DELETE_ERROR}\n${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!note_ids || note_ids === null || note_ids.length < 1) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTES_DELETE_ID_ERROR}` });
    return;
  }

  try {
    const response = await deleteNotes(req.user._id, note_ids);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTES_DELETE_ERROR}\n${errMessage}` });
    return;
  }
});

router.post("/edit-notebook-date", verifyUser, async function (req, res) {
  const data = req.body;
  const { notebookID, notebookUpdated } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({
      error: `${AC.NOTEBOOK_UPDATED_DATE_ERROR} ${AC.UNAUTHORIZED_USER}`,
    });
    return;
  }
  if (!notebookID || notebookID === null) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }
  if (!notebookUpdated || notebookUpdated === null) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_UPDATED_DATE_MISSING}` });
    return;
  }

  try {
    const response = await editNotebookDate(
      req.user._id,
      notebookID,
      notebookUpdated
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_UPDATED_DATE_ERROR}\n${errMessage}` });
    return;
  }
});

router.post("/move-notes", verifyUser, async function (req, res) {
  const data = req.body;
  const { notes, notebookID, latestUpdatedNote } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTES_MOVE_ERROR} ${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!notes || notes === undefined) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTES_MOVE_MISSING} ${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!notebookID || notebookID === undefined) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }
  if (!latestUpdatedNote || latestUpdatedNote === undefined) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_UPDATED_DATE_MISSING}` });
    return;
  }

  try {
    const response = await moveNotes(
      req.user._id,
      notes,
      notebookID,
      latestUpdatedNote
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTES_MOVE_ERROR}\n${errMessage}` });
    return;
  }
});

router.post("/delete-notebook", verifyUser, async function (req, res) {
  const data = req.body;
  const { notebookID } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_DELETE_ERROR} ${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!notebookID || notebookID === undefined) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }

  try {
    const response = await deleteNotebook(req.user._id, notebookID);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_DELETE_ERROR}\n${errMessage}` });
    return;
  }
});

router.post("/edit-notebook", verifyUser, async function (req, res) {
  const data = req.body;
  const { notebookID, notebookName, notebookCover, notebookUpdated } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTEBOOK_EDIT_ERROR} ${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!notebookID || notebookID === undefined) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }
  if (!notebookName || notebookName === undefined) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_NAME_ERROR}` });
    return;
  }
  if (!notebookCover || notebookCover === undefined) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_COVER_ERROR}` });
    return;
  }
  if (!notebookUpdated || notebookUpdated === undefined) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_UPDATED_DATE_MISSING}` });
    return;
  }

  try {
    const response = await editNotebook(
      req.user._id,
      notebookID,
      notebookName,
      notebookCover,
      notebookUpdated
    );
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_EDIT_ERROR}\n${errMessage}` });
    return;
  }
});

router.post("/save-note", verifyUser, async function (req, res) {
  const data = req.body;
  const { notebookID, noteID, note } = data;

  if (!req.user) {
    res.statusCode = 401;
    res.send({ error: `${AC.NOTE_SAVE_ERROR} ${AC.UNAUTHORIZED_USER}` });
    return;
  }
  if (!notebookID || notebookID === undefined) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTEBOOK_ID_ERROR}` });
    return;
  }
  if (!noteID || noteID === undefined) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTE_ID_ERROR}` });
    return;
  }
  if (!note || note === undefined) {
    res.statusCode = 400;
    res.send({ error: `${AC.NOTE_EMPTY}` });
    return;
  }

  try {
    const response = await saveNote(req.user._id, notebookID, noteID, note);
    if (response) {
      res.send(response);
      return;
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    res.statusCode = 400;
    res.send({ error: `${AC.NOTE_SAVE_ERROR}\n${errMessage}` });
    return;
  }
});

export const noteRouter = router;
