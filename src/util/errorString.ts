export const errString = (err: unknown, customError?: string) => {
  let messageResponseText = "";
  if (err instanceof Error) {
    if (err.message) {
      if (customError) {
        messageResponseText = `${customError}\n${err.message}`;
      } else {
        messageResponseText = `${err.message}`;
      }
    }
  } else {
    messageResponseText = `${err}`;
  }
  return messageResponseText;
};
