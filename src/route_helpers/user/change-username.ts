import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { errString } from "../../util/errorString";
import { UserInterface, ChangeUsername } from "../../types";
import { getUser } from "../../util/getUser";

const AC = APPLICATION_CONSTANTS;

export const changeUsername = async (
  newUsername: string,
  refreshToken: string
): Promise<ChangeUsername> => {
  if (
    !newUsername ||
    newUsername === undefined ||
    typeof newUsername !== "string"
  ) {
    return { error: `${AC.CHANGE_USER_UNIQUE}` };
  }
  if (newUsername.length < AC.USERNAME_MIN) {
    return { error: `${AC.CHANGE_USER_TOO_FEW}` };
  }
  if (newUsername.length > AC.USERNAME_MAX) {
    return { error: `${AC.CHANGE_USER_TOO_MANY}` };
  }

  let user: UserInterface;
  try {
    user = await getUser(refreshToken);
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: `${errMessage}` };
  }

  try {
    user.username = newUsername;
  } catch (err) {
    const errMessage = errString(err, AC.CHANGE_USER_ERROR);
    return { error: `${errMessage}` };
  }

  try {
    await user.save();
    return { success: true, details: user };
  } catch (err) {
    const errMessage = errString(err, AC.CHANGE_USER_ERROR);
    return { error: `${errMessage}` };
  }
};
