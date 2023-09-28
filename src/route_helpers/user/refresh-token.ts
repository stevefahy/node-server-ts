import APPLICATION_CONSTANTS from "../../application_constants/applicationConstants";
import { errString } from "../../util/errorString";
import { RefreshToken, UserInterface } from "../../types";
import { getUser } from "../../util/getUser";
import { getToken, getRefreshToken } from "../../authenticate";

const AC = APPLICATION_CONSTANTS;

export const refreshTheToken = async (
  refreshToken: string
): Promise<RefreshToken> => {
  let user: UserInterface;
  try {
    user = await getUser(refreshToken);
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: `${errMessage}` };
  }

  const userId = user._id;
  let token: string;
  let newRefreshToken: string;

  try {
    const tokenIndex = user.refreshToken.findIndex(
      (item) => item.refreshToken === refreshToken
    );
    if (tokenIndex === -1) {
      return { error: `${AC.UNAUTHORIZED_TOKEN}` };
    } else {
      token = getToken({ _id: userId });
      // If the refresh token exists, then create new one and replace it.
      newRefreshToken = getRefreshToken({ _id: userId });
      user.refreshToken[tokenIndex] = {
        refreshToken: newRefreshToken,
      };
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: `${errMessage}` };
  }

  try {
    await user.save();
    return { success: true, token, details: user, newRefreshToken };
  } catch (err) {
    const errMessage = errString(err);
    return { error: `${errMessage}` };
  }
};
