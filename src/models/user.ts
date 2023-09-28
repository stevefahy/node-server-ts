import mongoose, { Schema } from "mongoose";
import { UserInterface } from "../types";
import passportLocalMongoose from "passport-local-mongoose";

mongoose.Promise = global.Promise;

const Session = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
});

const User = new Schema<UserInterface>({
  username: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  authStrategy: {
    type: String,
    default: "local",
  },
  refreshToken: {
    type: [Session],
  },
});

//Remove refreshToken from the response
User.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.refreshToken;
    return ret;
  },
});

const options = {
  usernameField: "email",
  errorMessages: {
    MissingPasswordError: "No password was given",
    AttemptTooSoonError: "Account is currently locked. Try again later",
    TooManyAttemptsError:
      "Account locked due to too many failed login attempts",
    NoSaltValueStoredError: "Authentication not possible. No salt value stored",
    IncorrectPasswordError: "Password is incorrect",
    IncorrectUsernameError: "Username is incorrect",
    MissingUsernameError: "No email was given",
    UserExistsError: "A user with the given email is already registered",
  },
};

User.plugin(passportLocalMongoose, options);

export default mongoose.model("User", User);
