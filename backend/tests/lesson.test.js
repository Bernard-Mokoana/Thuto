import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { lessons } from "../src/model/lessons.js";
import { course } from "../src/model/course.js";
import { user } from "../src/model/user.js";
import { category } from "../src/model/category.js";

describe("Lesson API", () => {
  let testTutor;
  let testCourse;
  let testCategory;

  beforeAll(async () => {
    // Create a test tutor
    testTutor = await user.create({
      firstName: "Test",
      lastName: "Tutor",
      email: "lessontutor@gmail.com",
      password: "LessonTutor@123",
      role: "Tutor",
    });

    testCategory = await category.create({
      name: "Testing",
      description: "Software testing courses",
    });

    // Create a test course
    testCourse = await course.create({
      title: "Test Course for Lessons",
      category: testCategory._id,
      description: "A course for testing lessons",
      price: 300.0,
      tutor: testTutor._id,
      isPublished: true,
    });
  });

  afterAll(async () => {
    await lessons.deleteMany({});
    await course.deleteMany({});
    await user.deleteMany({});
    await category.deleteMany({});
  });

  describe("Lesson Model Tests", () => {
    it("should create a lesson with valid data", async () => {
      const lessonData = {
        course: testCourse._id,
        title: "Introduction to Testing",
        videoUrl: "https://example.com/video1.mp4",
        content: "This is the first lesson content",
        Order: 1,
      };

      const newLesson = await lessons.create(lessonData);

      expect(newLesson).toHaveProperty("_id");
      expect(newLesson.title).toBe("Introduction to Testing");
      expect(newLesson.course.toString()).toBe(testCourse._id.toString());
      expect(newLesson.videoUrl).toBe("https://example.com/video1.mp4");
      expect(newLesson.content).toBe("This is the first lesson content");
      expect(newLesson.Order).toBe(1);
    });

    it("should fail to create lesson without required fields", async () => {
      const lessonData = {
        videoUrl: "https://example.com/video2.mp4",
        content: "Lesson without title",
      };

      try {
        await lessons.create(lessonData);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle lesson with default Order value", async () => {
      const lessonData = {
        course: testCourse._id,
        title: "Lesson with Default Order",
        content: "This lesson should have default order",
      };

      const newLesson = await lessons.create(lessonData);

      expect(newLesson.Order).toBe(1); // default value
      expect(newLesson.title).toBe("Lesson with Default Order");
    });

    it("should create multiple lessons for a course", async () => {
      const lessonData1 = {
        course: testCourse._id,
        title: "Lesson 1",
        content: "First lesson",
        Order: 1,
      };

      const lessonData2 = {
        course: testCourse._id,
        title: "Lesson 2",
        content: "Second lesson",
        Order: 2,
      };

      const [lesson1, lesson2] = await lessons.create([
        lessonData1,
        lessonData2,
      ]);

      expect(lesson1.title).toBe("Lesson 1");
      expect(lesson2.title).toBe("Lesson 2");
      expect(lesson1.course.toString()).toBe(testCourse._id.toString());
      expect(lesson2.course.toString()).toBe(testCourse._id.toString());
    });
  });

  describe("Lesson Validation", () => {
    it("should validate lesson data structure", async () => {
      const lessonData = {
        course: testCourse._id,
        title: "Validation Test Lesson",
        videoUrl: "https://example.com/validation.mp4",
        content: "Test content for validation",
        Order: 5,
      };

      const newLesson = await lessons.create(lessonData);

      expect(newLesson).toHaveProperty("_id");
      expect(newLesson).toHaveProperty("course");
      expect(newLesson).toHaveProperty("title");
      expect(newLesson).toHaveProperty("videoUrl");
      expect(newLesson).toHaveProperty("content");
      expect(newLesson).toHaveProperty("Order");
      expect(newLesson).toHaveProperty("createdAt");
      expect(newLesson).toHaveProperty("updatedAt");
    });

    it("should handle lesson without optional fields", async () => {
      const lessonData = {
        course: testCourse._id,
        title: "Minimal Lesson",
      };

      const newLesson = await lessons.create(lessonData);

      expect(newLesson.title).toBe("Minimal Lesson");
      expect(newLesson.videoUrl).toBeUndefined();
      expect(newLesson.content).toBeUndefined();
      expect(newLesson.Order).toBe(1); // default value
    });
  });
});
