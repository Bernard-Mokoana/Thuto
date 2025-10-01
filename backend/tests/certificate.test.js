import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { certificate } from "../src/model/certification.js";
import { course } from "../src/model/course.js";
import { user } from "../src/model/user.js";
import { category } from "../src/model/category.js";

describe("Certificate API", () => {
  let testStudent;
  let testTutor;
  let testCourse;
  let testCategory;

  beforeAll(async () => {
    // Create a test student
    testStudent = await user.create({
      firstName: "Test",
      lastName: "Student",
      email: "certificatestudent@gmail.com",
      password: "CertificateStudent@123",
      role: "Student",
    });

    // Create a test tutor
    testTutor = await user.create({
      firstName: "Test",
      lastName: "Tutor",
      email: "certificatetutor@gmail.com",
      password: "CertificateTutor@123",
      role: "Tutor",
    });

    testCategory = await category.create({
      name: "Testing",
      description: "Software testing courses",
    });

    // Create a test course
    testCourse = await course.create({
      title: "Test Course for Certificates",
      category: testCategory._id,
      description: "A course for testing certificates",
      price: 400.0,
      tutor: testTutor._id,
      isPublished: true,
    });
  });

  afterAll(async () => {
    await certificate.deleteMany({});
    await course.deleteMany({});
    await user.deleteMany({});
    await category.deleteMany({});
  });

  describe("Certificate Model Tests", () => {
    it("should create a certificate with valid data", async () => {
      const certificateData = {
        student: testStudent._id,
        course: testCourse._id,
        grade: 85,
        certificateUrl: "https://example.com/certificate.pdf",
      };

      const newCertificate = await certificate.create(certificateData);

      expect(newCertificate).toHaveProperty("_id");
      expect(newCertificate.student.toString()).toBe(
        testStudent._id.toString()
      );
      expect(newCertificate.course.toString()).toBe(testCourse._id.toString());
      expect(newCertificate.grade).toBe(85);
      expect(newCertificate.certificateUrl).toBe(
        "https://example.com/certificate.pdf"
      );
      expect(newCertificate.issueAt).toBeInstanceOf(Date);
    });

    it("should fail to create certificate without required fields", async () => {
      const certificateData = {
        student: testStudent._id,
        certificateUrl: "https://example.com/certificate.pdf",
      };

      try {
        await certificate.create(certificateData);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle certificate with minimum required fields", async () => {
      const certificateData = {
        student: testStudent._id,
        course: testCourse._id,
        grade: 75,
      };

      const newCertificate = await certificate.create(certificateData);

      expect(newCertificate.grade).toBe(75);
      expect(newCertificate.certificateUrl).toBeUndefined();
      expect(newCertificate.issueAt).toBeInstanceOf(Date);
    });

    it("should create certificate with different grades", async () => {
      const grades = [50, 75, 85, 95, 100];

      for (const grade of grades) {
        const certificateData = {
          student: testStudent._id,
          course: testCourse._id,
          grade: grade,
        };

        const newCertificate = await certificate.create(certificateData);
        expect(newCertificate.grade).toBe(grade);
      }
    });
  });

  describe("Certificate Validation", () => {
    it("should validate certificate data structure", async () => {
      const certificateData = {
        student: testStudent._id,
        course: testCourse._id,
        grade: 95,
        certificateUrl: "https://example.com/cert3.pdf",
      };

      const newCertificate = await certificate.create(certificateData);

      expect(newCertificate).toHaveProperty("_id");
      expect(newCertificate).toHaveProperty("student");
      expect(newCertificate).toHaveProperty("course");
      expect(newCertificate).toHaveProperty("issueAt");
      expect(newCertificate).toHaveProperty("grade");
      expect(newCertificate).toHaveProperty("certificateUrl");
      expect(newCertificate).toHaveProperty("createdAt");
      expect(newCertificate).toHaveProperty("updatedAt");
    });

    it("should handle certificate with URL", async () => {
      const certificateData = {
        student: testStudent._id,
        course: testCourse._id,
        grade: 88,
        certificateUrl: "https://example.com/cert1.pdf",
      };

      const newCertificate = await certificate.create(certificateData);

      expect(newCertificate.grade).toBe(88);
      expect(newCertificate.certificateUrl).toBe(
        "https://example.com/cert1.pdf"
      );
      expect(newCertificate.issueAt).toBeInstanceOf(Date);
    });
  });

  describe("Certificate Grade Validation", () => {
    it("should accept valid grade values", async () => {
      const validGrades = [0, 50, 75, 85, 95, 100];

      for (const grade of validGrades) {
        const certificateData = {
          student: testStudent._id,
          course: testCourse._id,
          grade: grade,
        };

        const newCertificate = await certificate.create(certificateData);
        expect(newCertificate.grade).toBe(grade);
      }
    });

    it("should handle decimal grades", async () => {
      const certificateData = {
        student: testStudent._id,
        course: testCourse._id,
        grade: 87.5,
      };

      const newCertificate = await certificate.create(certificateData);
      expect(newCertificate.grade).toBe(87.5);
    });
  });

  describe("Certificate Relationships", () => {
    it("should maintain proper relationships with student and course", async () => {
      const certificateData = {
        student: testStudent._id,
        course: testCourse._id,
        grade: 92,
      };

      const newCertificate = await certificate.create(certificateData);

      // Verify the certificate references the correct student and course
      expect(newCertificate.student.toString()).toBe(
        testStudent._id.toString()
      );
      expect(newCertificate.course.toString()).toBe(testCourse._id.toString());

      // Verify the student and course exist
      const student = await user.findById(testStudent._id);
      const courseDoc = await course.findById(testCourse._id);

      expect(student).toBeDefined();
      expect(courseDoc).toBeDefined();
    });
  });
});
