import mongoose, { Schema } from "mongoose";
import { NoteInterface } from "../types";

mongoose.Promise = global.Promise;

const Note = new Schema<NoteInterface>({
  user: {
    type: Schema.Types.ObjectId,
  },
  notebook: {
    type: String,
    default: "",
  },
  note: {
    type: String,
    default: "",
  },
});

export default mongoose.model("Note", Note);
