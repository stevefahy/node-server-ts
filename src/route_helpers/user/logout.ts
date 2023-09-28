import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { errString } from "../../util/errorString";
import { Logout, UserInterface } from "../../types";
import { getUser } from "../../util/getUser";

const AC = APPLICATION_CONSTANTS;

export const logout = async (refreshToken: string): Promise<Logout> => {
  let user: UserInterface;
  try {
    user = await getUser(refreshToken);
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: `${errMessage}` };
  }

  try {
    const tokenIndex = user.refreshToken.findIndex(
      (item) => item.refreshToken === refreshToken
    );
    if (tokenIndex === -1) {
      return { error: `${AC.UNAUTHORIZED_TOKEN}` };
    } else {
      user.refreshToken.splice(tokenIndex, 1);
    }
  } catch (err: unknown) {
    const errMessage = errString(err, AC.LOGOUT_ERROR);
    return { error: `${errMessage}` };
  }

  try {
    await user.save();
    return { success: true };
  } catch (err) {
    const errMessage = errString(err, AC.LOGOUT_ERROR);
    return { error: `${errMessage}` };
  }
};
