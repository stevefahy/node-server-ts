import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { UserInterface, ChangeUsername } from "../../types";
import { getUser } from "../../util/getUser";

const AC = APPLICATION_CONSTANTS;

export const changeUsername = async (
  newUsername: string,
  refreshToken: string,
): Promise<ChangeUsername> => {
  if (
    !newUsername ||
    newUsername === undefined ||
    typeof newUsername !== "string"
  ) {
    return { error: AC.CHANGE_USER_REQUIRED };
  }
  if (newUsername.length < AC.USERNAME_MIN) {
    return { error: AC.CHANGE_USER_TOO_FEW };
  }
  if (newUsername.length > AC.USERNAME_MAX) {
    return { error: AC.CHANGE_USER_TOO_MANY };
  }

  let user: UserInterface;
  try {
    user = await getUser(refreshToken);
  } catch (err: unknown) {
    console.error("changeUsername getUser error:", err);
    return { error: AC.CHANGE_USER_ERROR };
  }

  try {
    user.username = newUsername;
  } catch (err) {
    console.error("changeUsername assign error:", err);
    return { error: AC.CHANGE_USER_ERROR };
  }

  try {
    await user.save();
    return { success: true, details: user };
  } catch (err) {
    console.error("changeUsername save error:", err);
    return { error: AC.CHANGE_USER_ERROR };
  }
};
