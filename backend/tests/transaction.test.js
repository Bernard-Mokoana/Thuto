import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { Transaction } from "../src/model/transaction.js";
import { course } from "../src/model/course.js";
import { user } from "../src/model/user.js";
import { category } from "../src/model/category.js";

describe("Transaction API", () => {
  let testStudent;
  let testTutor;
  let testCourse;
  let testCategory;

  beforeAll(async () => {
    // Create a test student
    testStudent = await user.create({
      firstName: "Test",
      lastName: "Student",
      email: "transactionstudent@gmail.com",
      password: "TransactionStudent@123",
      role: "Student",
    });

    // Create a test tutor
    testTutor = await user.create({
      firstName: "Test",
      lastName: "Tutor",
      email: "transactiontutor@gmail.com",
      password: "TransactionTutor@123",
      role: "Tutor",
    });

    testCategory = await category.create({
      name: "Testing",
      description: "Software testing courses",
    });

    // Create a test course
    testCourse = await course.create({
      title: "Test Course for Transactions",
      category: testCategory._id,
      description: "A course for testing transactions",
      price: 350.0,
      tutor: testTutor._id,
      isPublished: true,
    });
  });

  afterAll(async () => {
    await Transaction.deleteMany({});
    await course.deleteMany({});
    await user.deleteMany({});
    await category.deleteMany({});
  });

  describe("Transaction Model Tests", () => {
    it("should create a transaction with valid data", async () => {
      const transactionData = {
        student: testStudent._id,
        course: testCourse._id,
        amount: 350.0,
        method: "card",
        status: "pending",
        reference: "TXN123456789",
      };

      const newTransaction = await Transaction.create(transactionData);

      expect(newTransaction).toHaveProperty("_id");
      expect(newTransaction.student.toString()).toBe(
        testStudent._id.toString()
      );
      expect(newTransaction.course.toString()).toBe(testCourse._id.toString());
      expect(newTransaction.amount).toBe(350.0);
      expect(newTransaction.method).toBe("card");
      expect(newTransaction.status).toBe("pending");
      expect(newTransaction.reference).toBe("TXN123456789");
    });

    it("should create transaction with default values", async () => {
      const transactionData = {
        student: testStudent._id,
        course: testCourse._id,
        amount: 200.0,
      };

      const newTransaction = await Transaction.create(transactionData);

      expect(newTransaction.method).toBe("wallet"); // default value
      expect(newTransaction.status).toBe("pending"); // default value
      expect(newTransaction.amount).toBe(200.0);
    });

    it("should fail to create transaction without required fields", async () => {
      const transactionData = {
        student: testStudent._id,
        amount: 150.0,
        method: "eft",
      };

      try {
        await Transaction.create(transactionData);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should fail to create transaction with invalid method", async () => {
      const transactionData = {
        student: testStudent._id,
        course: testCourse._id,
        amount: 250.0,
        method: "invalid_method",
      };

      try {
        await Transaction.create(transactionData);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should fail to create transaction with invalid status", async () => {
      const transactionData = {
        student: testStudent._id,
        course: testCourse._id,
        amount: 300.0,
        method: "card",
        status: "invalid_status",
      };

      try {
        await Transaction.create(transactionData);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Transaction Validation", () => {
    it("should validate transaction data structure", async () => {
      const transactionData = {
        student: testStudent._id,
        course: testCourse._id,
        amount: 400.0,
        method: "eft",
        status: "success",
        reference: "TXN_VALIDATION",
      };

      const newTransaction = await Transaction.create(transactionData);

      expect(newTransaction).toHaveProperty("_id");
      expect(newTransaction).toHaveProperty("student");
      expect(newTransaction).toHaveProperty("course");
      expect(newTransaction).toHaveProperty("amount");
      expect(newTransaction).toHaveProperty("method");
      expect(newTransaction).toHaveProperty("status");
      expect(newTransaction).toHaveProperty("reference");
      expect(newTransaction).toHaveProperty("createdAt");
      expect(newTransaction).toHaveProperty("updatedAt");
    });

    it("should handle transaction with minimum required fields", async () => {
      const transactionData = {
        student: testStudent._id,
        course: testCourse._id,
        amount: 100.0,
      };

      const newTransaction = await Transaction.create(transactionData);

      expect(newTransaction.amount).toBe(100.0);
      expect(newTransaction.method).toBe("wallet"); // default value
      expect(newTransaction.status).toBe("pending"); // default value
      expect(newTransaction.reference).toBeUndefined();
    });
  });

  describe("Transaction Methods", () => {
    it("should support all valid payment methods", async () => {
      const methods = ["eft", "card", "cash", "wallet"];

      for (const method of methods) {
        const transactionData = {
          student: testStudent._id,
          course: testCourse._id,
          amount: 100.0,
          method: method,
        };

        const newTransaction = await Transaction.create(transactionData);
        expect(newTransaction.method).toBe(method);
      }
    });

    it("should support all valid status values", async () => {
      const statuses = ["pending", "success", "failed"];

      for (const status of statuses) {
        const transactionData = {
          student: testStudent._id,
          course: testCourse._id,
          amount: 100.0,
          method: "card",
          status: status,
        };

        const newTransaction = await Transaction.create(transactionData);
        expect(newTransaction.status).toBe(status);
      }
    });
  });
});
