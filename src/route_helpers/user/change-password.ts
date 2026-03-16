import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { ChangePassword, UserInterface } from "../../types";
import { getUser } from "../../util/getUser";

const AC = APPLICATION_CONSTANTS;

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
  refreshToken: string
): Promise<ChangePassword> => {
  if (oldPassword === newPassword) {
    return { error: AC.CHANGE_PASS_UNIQUE };
  }
  if (
    oldPassword.length < AC.PASSWORD_MIN ||
    newPassword.length < AC.PASSWORD_MIN
  ) {
    return { error: AC.CHANGE_PASS_TOO_FEW };
  }
  if (
    oldPassword.length > AC.PASSWORD_MAX ||
    newPassword.length > AC.PASSWORD_MAX
  ) {
    return { error: AC.CHANGE_PASS_TOO_MANY };
  }

  let user: UserInterface;
  try {
    user = await getUser(refreshToken);
  } catch (err: unknown) {
    console.error("changePassword getUser error:", err);
    return { error: AC.CHANGE_PASS_ERROR };
  }

  try {
    await user.changePassword(oldPassword, newPassword);
  } catch (err) {
    console.error("changePassword changePassword error:", err);
    return { error: AC.CHANGE_PASS_ERROR };
  }

  try {
    await user.save();
    return { success: true };
  } catch (err) {
    console.error("changePassword save error:", err);
    return { error: AC.CHANGE_PASS_ERROR };
  }
};
