import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["test/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      COOKIE_SECRET: "test_cookie_secret_value_minimum_len",
      EXPRESS_SESSION_SECRET: "test_express_session_secret_value__",
      JWT_SECRET: "test_jwt_secret_must_be_at_least_32_chars",
      REFRESH_TOKEN_SECRET: "test_refresh_token_secret_32_chars__",
      SESSION_EXPIRY: "3600",
      REFRESH_TOKEN_EXPIRY: "86400",
      MONGODB_USERNAME: "test",
      MONGODB_PASSWORD: "test",
      MONGODB_URL: "127.0.0.1:27017",
      MONGODB_DB_NAME: "test",
      WHITELISTED_DOMAINS: "",
    },
  },
});
