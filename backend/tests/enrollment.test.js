import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { enrollment } from "../src/model/enrollment.js";
import { course } from "../src/model/course.js";
import { user } from "../src/model/user.js";
import { category } from "../src/model/category.js";

describe("Enrollment API", () => {
  let testStudent;
  let testTutor;
  let testCourse;
  let testCategory;

  beforeAll(async () => {
    testStudent = await user.create({
      firstName: "Test",
      lastName: "Student",
      email: "enrollmentstudent@gmail.com",
      password: "EnrollmentStudent@123",
      role: "Student",
    });

    testTutor = await user.create({
      firstName: "Test",
      lastName: "Tutor",
      email: "enrollmenttutor@gmail.com",
      password: "EnrollmentTutor@123",
      role: "Tutor",
    });

    testCategory = await category.create({
      name: "Testing",
      description: "Software testing courses",
    });

    testCourse = await course.create({
      title: "Test Course for Enrollments",
      category: testCategory._id,
      description: "A course for testing enrollments",
      price: 300.0,
      tutor: testTutor._id,
      isPublished: true,
    });
  });

  afterAll(async () => {
    await enrollment.deleteMany({});
    await course.deleteMany({});
    await user.deleteMany({});
    await category.deleteMany({});
  });

  describe("Enrollment Model Tests", () => {
    it("should create an enrollment with valid data", async () => {
      const enrollmentData = {
        student: testStudent._id,
        course: testCourse._id,
        enrolledAt: new Date(),
      };

      const newEnrollment = await enrollment.create(enrollmentData);

      expect(newEnrollment).toHaveProperty("_id");
      expect(newEnrollment.student.toString()).toBe(testStudent._id.toString());
      expect(newEnrollment.course.toString()).toBe(testCourse._id.toString());
      expect(newEnrollment.progress).toBeInstanceOf(Array);
      expect(newEnrollment.enrolledAt).toBeInstanceOf(Date);
    });

    it("should fail to create enrollment without required fields", async () => {
      const enrollmentData = {
        student: testStudent._id,
      };

      try {
        await enrollment.create(enrollmentData);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle enrollment with default values", async () => {
      const enrollmentData = {
        student: testStudent._id,
        course: testCourse._id,
      };

      const newEnrollment = await enrollment.create(enrollmentData);

      expect(newEnrollment.progress).toBeInstanceOf(Array);
      expect(newEnrollment.progress.length).toBe(0);
      expect(newEnrollment.enrolledAt).toBeInstanceOf(Date);
      expect(newEnrollment.certificateUrl).toBeUndefined();
    });

    it("should create enrollment with progress tracking", async () => {
      const lessonId = new mongoose.Types.ObjectId();
      const enrollmentData = {
        student: testStudent._id,
        course: testCourse._id,
        progress: [
          {
            lesson: lessonId,
            completed: true,
            completedAt: new Date(),
          },
        ],
      };

      const newEnrollment = await enrollment.create(enrollmentData);

      expect(newEnrollment.progress).toHaveLength(1);
      expect(newEnrollment.progress[0].lesson.toString()).toBe(
        lessonId.toString()
      );
      expect(newEnrollment.progress[0].completed).toBe(true);
      expect(newEnrollment.progress[0].completedAt).toBeInstanceOf(Date);
    });
  });

  describe("Enrollment Validation", () => {
    it("should validate enrollment data structure", async () => {
      const enrollmentData = {
        student: testStudent._id,
        course: testCourse._id,
        enrolledAt: new Date(),
        certificateUrl: "https://example.com/certificate.pdf",
      };

      const newEnrollment = await enrollment.create(enrollmentData);

      expect(newEnrollment).toHaveProperty("_id");
      expect(newEnrollment).toHaveProperty("student");
      expect(newEnrollment).toHaveProperty("course");
      expect(newEnrollment).toHaveProperty("progress");
      expect(newEnrollment).toHaveProperty("enrolledAt");
      expect(newEnrollment).toHaveProperty("certificateUrl");
      expect(newEnrollment).toHaveProperty("createdAt");
      expect(newEnrollment).toHaveProperty("updatedAt");
    });

    it("should handle enrollment with certificate URL", async () => {
      const enrollmentData = {
        student: testStudent._id,
        course: testCourse._id,
        certificateUrl: "https://example.com/certificate.pdf",
      };

      const newEnrollment = await enrollment.create(enrollmentData);

      expect(newEnrollment.certificateUrl).toBe(
        "https://example.com/certificate.pdf"
      );
      expect(newEnrollment.progress).toBeInstanceOf(Array);
      expect(newEnrollment.enrolledAt).toBeInstanceOf(Date);
    });
  });

  describe("Enrollment Uniqueness", () => {
    it("should enforce unique constraint on student and course", async () => {
      const enrollmentData = {
        student: testStudent._id,
        course: testCourse._id,
      };

      await enrollment.create(enrollmentData);

      try {
        await enrollment.create(enrollmentData);
        fail("Should have thrown a duplicate key error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow multiple enrollments for different students", async () => {
      const newStudent = await user.create({
        firstName: "Another",
        lastName: "Student",
        email: "anotherstudent@gmail.com",
        password: "AnotherStudent@123",
        role: "Student",
      });

      const enrollment1 = await enrollment.create({
        student: testStudent._id,
        course: testCourse._id,
      });

      const enrollment2 = await enrollment.create({
        student: newStudent._id,
        course: testCourse._id,
      });

      expect(enrollment1.student.toString()).toBe(testStudent._id.toString());
      expect(enrollment2.student.toString()).toBe(newStudent._id.toString());
      expect(enrollment1.course.toString()).toBe(testCourse._id.toString());
      expect(enrollment2.course.toString()).toBe(testCourse._id.toString());
    });
  });

  describe("Enrollment Progress Tracking", () => {
    it("should track multiple lesson completions", async () => {
      const lesson1Id = new mongoose.Types.ObjectId();
      const lesson2Id = new mongoose.Types.ObjectId();

      const enrollmentData = {
        student: testStudent._id,
        course: testCourse._id,
        progress: [
          {
            lesson: lesson1Id,
            completed: true,
            completedAt: new Date(),
          },
          {
            lesson: lesson2Id,
            completed: false,
          },
        ],
      };

      const newEnrollment = await enrollment.create(enrollmentData);

      expect(newEnrollment.progress).toHaveLength(2);
      expect(newEnrollment.progress[0].completed).toBe(true);
      expect(newEnrollment.progress[1].completed).toBe(false);
      expect(newEnrollment.progress[0].completedAt).toBeInstanceOf(Date);
      expect(newEnrollment.progress[1].completedAt).toBeUndefined();
    });
  });
});
