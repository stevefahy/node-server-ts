import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import "../src/strategies/JwtStrategy";
import "../src/strategies/LocalStrategy";
import "../src/authenticate";
import { createApp } from "../src/app";
import APPLICATION_CONSTANTS from "../src/application_constants/applicationConstants";

const AC = APPLICATION_CONSTANTS;

describe("createApp", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it("GET / returns success", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "success" });
  });

  it("POST /api/auth/login with missing body returns 400", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(AC.SIGNUP_INVALID_EMAIL);
  });

  it("GET /api/data/notebooks without token returns 401", async () => {
    const res = await request(app).get("/api/data/notebooks");
    expect(res.status).toBe(401);
  });
});
