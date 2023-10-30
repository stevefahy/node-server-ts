import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { CreateWelcomeNote, Signup, UserInterface } from "../../types";
import { getToken, getRefreshToken } from "../../authenticate";
import User from "../../models/user";
import { createWelcomeNote } from "./welcome-note";

const AC = APPLICATION_CONSTANTS;

export const signup = async (
  username: string,
  email: string,
  password: string,
  framework: string
): Promise<Signup> => {
  let user: UserInterface;
  let token: string;
  let refreshToken: string;
  let welcome_note: CreateWelcomeNote;
  try {
    user = await User.register(new User({ email: email }), password);
  } catch (err) {
    throw new Error(`${AC.CREATE_USER_ERROR} ${err}`);
  }

  try {
    user.username = username;
    user.email = email;
    token = getToken({ _id: user._id });
    refreshToken = getRefreshToken({ _id: user._id });
    user.refreshToken.push({ refreshToken });
    await user.save();
  } catch (err) {
    throw new Error(`${AC.CREATE_USER_ERROR} ${err}`);
  }

  try {
    welcome_note = await createWelcomeNote(user._id, framework);
    let notebookID;
    let noteID;
    if (welcome_note && welcome_note.success) {
      notebookID = welcome_note.data.notebookID;
      noteID = welcome_note.data.noteID;
      return {
        success: true,
        details: user,
        token,
        notebookID,
        noteID,
        refreshToken,
      };
    } else {
      throw new Error(AC.SIGNUP_WELCOME_NOTE);
    }
  } catch (err) {
    throw new Error(AC.SIGNUP_WELCOME_NOTE);
  }
};
