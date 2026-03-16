import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { Logout, UserInterface } from "../../types";
import { getUser } from "../../util/getUser";

const AC = APPLICATION_CONSTANTS;

export const logout = async (refreshToken: string): Promise<Logout> => {
  let user: UserInterface;
  try {
    user = await getUser(refreshToken);
  } catch (err: unknown) {
    console.error("logout getUser error:", err);
    return { error: AC.LOGOUT_ERROR };
  }

  try {
    const tokenIndex = user.refreshToken.findIndex(
      (item) => item.refreshToken === refreshToken
    );
    if (tokenIndex === -1) {
      return { error: AC.UNAUTHORIZED_TOKEN };
    } else {
      user.refreshToken.splice(tokenIndex, 1);
    }
  } catch (err: unknown) {
    console.error("logout tokenIndex error:", err);
    return { error: AC.LOGOUT_ERROR };
  }

  try {
    await user.save();
    return { success: true };
  } catch (err) {
    console.error("logout save error:", err);
    return { error: AC.LOGOUT_ERROR };
  }
};
