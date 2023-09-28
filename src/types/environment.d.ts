import { UserInterface } from ".";
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_PORT: string;
      DB_USER: string;
      ENV: "test" | "development" | "production";
      MONGODB_USERNAME: string;
      MONGODB_PASSWORD: string;
      MONGODB_URL: string;
      MONGODB_DB_NAME: string;
      JWT_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      EXPRESS_SESSION_SECRET: string;
      REFRESH_TOKEN_EXPIRY: string;
      SESSION_EXPIRY: string;
      COOKIE_SECRET: string;
      WHITELISTED_DOMAINS: string;
    }
  }
}

// type _User = User;

declare global {
  namespace Express {
    interface User extends UserInterface {
      _id: string;
    }
  }
}