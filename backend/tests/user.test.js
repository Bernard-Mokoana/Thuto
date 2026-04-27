import request from "supertest";
import app from "../src/app.js";
import { user } from "../src/model/user.js";

describe("User API", () => {
  afterAll(async () => {
    await user.deleteMany({});
  });

  describe("POST /api/v1/users/register", () => {
    it("should register a new user", async () => {
      const userData = {
        firstName: "Bernard",
        lastName: "Mokoana",
        email: "bernard@gmail.com",
        password: "Bernard@123",
        role: "Student",
      };

      const res = await request(app)
        .post("/api/v1/users/register")
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.newUser).toHaveProperty("_id");
      expect(res.body.newUser.email).toBe("bernard@gmail.com");
      expect(res.body.newUser.firstName).toBe("Bernard");
      expect(res.body.newUser.lastName).toBe("Mokoana");
      expect(res.body.newUser.role).toBe("Student");
    });

    it("should fail to register with missing fields", async () => {
      const userData = {
        firstName: "Test",
        email: "test@gmail.com",
        password: "Test@123",
      };

      const res = await request(app)
        .post("/api/v1/users/register")
        .send(userData);

      expect(res.statusCode).toBe(400);
    });

    it("should fail to register with existing email", async () => {
      // First registration
      await request(app).post("/api/v1/users/register").send({
        firstName: "Dira",
        lastName: "Mokoana",
        email: "dira@gmail.com",
        password: "Dira@123",
        role: "Student",
      });

      // Second registration with same email
      const res = await request(app).post("/api/v1/users/register").send({
        firstName: "Another",
        lastName: "User",
        email: "dira@gmail.com",
        password: "Another@123",
        role: "Student",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Create a test user for login
      await request(app).post("/api/v1/users/register").send({
        firstName: "Login",
        lastName: "Test",
        email: "logintest@gmail.com",
        password: "LoginTest@123",
        role: "Student",
      });

      await user.updateOne(
        { email: "logintest@gmail.com" },
        { $set: { isVerified: true } }
      );
    });

    it("should login a user successfully", async () => {
      const loginData = {
        email: "logintest@gmail.com",
        password: "LoginTest@123",
      };

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("logintest@gmail.com");
      expect(res.body.user.isVerified).toBe(true);
    });

    it("should fail to login with wrong password", async () => {
      const loginData = {
        email: "logintest@gmail.com",
        password: "WrongPassword@123",
      };

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(res.statusCode).toBe(400);
    });

    it("should fail to login with non-existent email", async () => {
      const loginData = {
        email: "nonexistent@gmail.com",
        password: "Test@123",
      };

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(res.statusCode).toBe(400);
    });

    it("should fail to login with missing fields", async () => {
      const loginData = {
        email: "logintest@gmail.com",
      };

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(res.statusCode).toBe(400);
    });
  });
});
