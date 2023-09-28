import { JwtFromRequestFunction } from "passport-jwt";
import { Document, Schema } from "mongoose";
import { Db, MongoClient, ObjectId, UpdateResult } from "mongodb";

// User Signup / Login / Token /

export interface PassportLocalDocument extends Document {
  setPassword(password: string): Promise<PassportLocalDocument>;
  changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<PassportLocalDocument>;
}

export interface userToken {
  _id: string;
}

export type Opts = {
  jwtFromRequest: JwtFromRequestFunction;
  secretOrKey: string;
};

interface RefreshTokenInterface {
  _id?: Schema.Types.ObjectId;
  refreshToken: string;
}

export interface UserInterface extends Document {
  username: string;
  email: string;
  authStrategy: {
    type: string;
    default: "local";
  };
  _id: string;
  refreshToken: RefreshTokenInterface[];
  changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<PassportLocalDocument>;
}

// AuthContext

interface ChangeUsernameError {
  error: string;
  success?: never;
  details?: never;
}

interface ChangeUsernameSuccess {
  error?: never;
  success: boolean;
  details: UserInterface;
}

export type ChangeUsername = ChangeUsernameError | ChangeUsernameSuccess;

interface ChangePasswordError {
  error: string;
  success?: never;
}

interface ChangePasswordSuccess {
  error?: never;
  success: boolean;
}

export type ChangePassword = ChangePasswordError | ChangePasswordSuccess;

interface LogoutError {
  error: string;
  success?: never;
}

interface LogoutSuccess {
  error?: never;
  success: boolean;
}

export type Logout = LogoutError | LogoutSuccess;

interface RefreshTokenError {
  error: string;
  success?: never;
  token?: never;
  details?: never;
  newRefreshToken?: never;
}

interface RefreshTokenSuccess {
  error?: never;
  success: boolean;
  token: string;
  details: UserInterface;
  newRefreshToken: string;
}

export type RefreshToken = RefreshTokenError | RefreshTokenSuccess;

// Note

export type ISODateString = string;

export interface Note {
  _id: string;
  note: string;
  notebook: string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface NoteInterface extends Document {
  user: Schema.Types.ObjectId;
  notebook: string;
  note: string;
}

export interface Notes {
  notes: Note[] | null;
}

// Notebook

export type NotebookCoverType = "default" | "red" | "green" | "blue";

export interface Notebook {
  _id: string;
  notebook_name: string;
  notebook_cover: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface NotebookDateUpdated extends UpdateResult {
  _id: ObjectId;
  updatedAt: Date;
}

export interface Notebooks {
  notebooks: Notebook[];
}

export interface Signup {
  success: boolean;
  details: UserInterface;
  token: string;
  notebookID: ObjectId;
  noteID: ObjectId;
  refreshToken?: string;
}

// DB Connection

interface DBError {
  error: boolean;
  error_message: string;
  client?: never | false;
  db?: never | false;
  mongo_connected?: never;
}

interface DBConnected {
  error?: never;
  error_message?: never;
  client: MongoClient;
  db: Db;
  mongo_connected: boolean;
}

export type DBConnect = DBError | DBConnected;

export interface CreateWelcomeNote {
  success: boolean;
  data: {
    notebookID: ObjectId;
    noteID: ObjectId;
  };
}
