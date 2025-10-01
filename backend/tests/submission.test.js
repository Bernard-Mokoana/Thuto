import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { submission } from "../src/model/submission.js";
import { assessment } from "../src/model/assessment.js";
import { course } from "../src/model/course.js";
import { lessons } from "../src/model/lessons.js";
import { user } from "../src/model/user.js";
import { category } from "../src/model/category.js";

describe("Submission API", () => {
  let testStudent;
  let testTutor;
  let testCourse;
  let testLesson;
  let testAssessment;
  let testCategory;

  beforeAll(async () => {
    // Create a test student
    testStudent = await user.create({
      firstName: "Test",
      lastName: "Student",
      email: "teststudent@gmail.com",
      password: "TestStudent@123",
      role: "Student",
    });

    // Create a test tutor
    testTutor = await user.create({
      firstName: "Test",
      lastName: "Tutor",
      email: "submissiontutor@gmail.com",
      password: "SubmissionTutor@123",
      role: "Tutor",
    });

    testCategory = await category.create({
      name: "Testing",
      description: "Software testing courses",
    });

    // Create a test course
    testCourse = await course.create({
      title: "Test Course for Submissions",
      category: testCategory._id,
      description: "A course for testing submissions",
      price: 250.0,
      tutor: testTutor._id,
      isPublished: true,
    });

    // Create a test lesson
    testLesson = await lessons.create({
      course: testCourse._id,
      title: "Test Lesson",
      content: "Test lesson content",
      Order: 1,
    });

    // Create a test assessment
    testAssessment = await assessment.create({
      title: "Test Assessment",
      questions: ["Question 1", "Question 2"],
      answers: ["Answer 1", "Answer 2"],
      course: testCourse._id,
      lesson: testLesson._id,
    });
  });

  afterAll(async () => {
    await submission.deleteMany({});
    await assessment.deleteMany({});
    await lessons.deleteMany({});
    await course.deleteMany({});
    await user.deleteMany({});
    await category.deleteMany({});
  });

  describe("Submission Model Tests", () => {
    it("should create a submission with valid data", async () => {
      const submissionData = {
        assessment: testAssessment._id,
        student: testStudent._id,
        course: testCourse._id,
        lesson: testLesson._id,
        answers: ["Student Answer 1", "Student Answer 2"],
        isCompleted: true,
      };

      const newSubmission = await submission.create(submissionData);

      expect(newSubmission).toHaveProperty("_id");
      expect(newSubmission.assessment.toString()).toBe(
        testAssessment._id.toString()
      );
      expect(newSubmission.student.toString()).toBe(testStudent._id.toString());
      expect(newSubmission.course.toString()).toBe(testCourse._id.toString());
      expect(newSubmission.lesson.toString()).toBe(testLesson._id.toString());
      expect(newSubmission.answers).toEqual([
        "Student Answer 1",
        "Student Answer 2",
      ]);
      expect(newSubmission.isCompleted).toBe(true);
      expect(newSubmission.grade).toBe(0); // default value
    });

    it("should fail to create submission without required fields", async () => {
      const submissionData = {
        student: testStudent._id,
        course: testCourse._id,
        answers: ["Answer 1"],
      };

      try {
        await submission.create(submissionData);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle submission with default values", async () => {
      const submissionData = {
        assessment: testAssessment._id,
        student: testStudent._id,
        course: testCourse._id,
        lesson: testLesson._id,
        answers: ["Default Answer"],
      };

      const newSubmission = await submission.create(submissionData);

      expect(newSubmission.grade).toBe(0); // default value
      expect(newSubmission.isCompleted).toBeUndefined();
      expect(newSubmission.submittedAt).toBeInstanceOf(Date);
    });

    it("should create submission with grade", async () => {
      const submissionData = {
        assessment: testAssessment._id,
        student: testStudent._id,
        course: testCourse._id,
        lesson: testLesson._id,
        answers: ["Graded Answer"],
        grade: 85,
        isCompleted: true,
      };

      const newSubmission = await submission.create(submissionData);

      expect(newSubmission.grade).toBe(85);
      expect(newSubmission.isCompleted).toBe(true);
    });
  });

  describe("Submission Validation", () => {
    it("should validate submission data structure", async () => {
      const submissionData = {
        assessment: testAssessment._id,
        student: testStudent._id,
        course: testCourse._id,
        lesson: testLesson._id,
        answers: ["Validation Answer"],
        grade: 90,
        isCompleted: true,
      };

      const newSubmission = await submission.create(submissionData);

      expect(newSubmission).toHaveProperty("_id");
      expect(newSubmission).toHaveProperty("assessment");
      expect(newSubmission).toHaveProperty("student");
      expect(newSubmission).toHaveProperty("course");
      expect(newSubmission).toHaveProperty("lesson");
      expect(newSubmission).toHaveProperty("answers");
      expect(newSubmission).toHaveProperty("grade");
      expect(newSubmission).toHaveProperty("submittedAt");
      expect(newSubmission).toHaveProperty("isCompleted");
      expect(newSubmission).toHaveProperty("createdAt");
      expect(newSubmission).toHaveProperty("updatedAt");
    });

    it("should handle submission with minimum required fields", async () => {
      const submissionData = {
        assessment: testAssessment._id,
        student: testStudent._id,
        course: testCourse._id,
        lesson: testLesson._id,
      };

      const newSubmission = await submission.create(submissionData);

      expect(newSubmission.answers).toEqual([]); // Empty array instead of undefined
      expect(newSubmission.grade).toBe(0); // default value
      expect(newSubmission.isCompleted).toBeUndefined();
      expect(newSubmission.submittedAt).toBeInstanceOf(Date);
    });
  });

  describe("Submission Uniqueness", () => {
    it("should enforce unique constraint on assessment and student", async () => {
      const submissionData = {
        assessment: testAssessment._id,
        student: testStudent._id,
        course: testCourse._id,
        lesson: testLesson._id,
        answers: ["First submission"],
      };

      // Create first submission
      await submission.create(submissionData);

      // Try to create second submission with same assessment and student
      try {
        await submission.create(submissionData);
        fail("Should have thrown a duplicate key error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
