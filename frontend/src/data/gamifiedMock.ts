import type {
  Category,
  LearningLesson,
  LearningModule,
  LearningPath,
  LessonStep,
  PathEnrollment,
  UserGamification,
} from "../types/models";

export const mockCategories: Category[] = [
  { _id: "cat-web", name: "Web Development", color: "#2563eb", pathCount: 2 },
  { _id: "cat-code", name: "Programming", color: "#16a34a", pathCount: 1 },
];

export const mockPaths: LearningPath[] = [
  {
    _id: "path-web-basics",
    title: "Web Development Basics",
    slug: "web-development-basics",
    description:
      "Build daily coding habits through short HTML, CSS, and JavaScript exercises.",
    level: "beginner",
    estimatedMinutes: 85,
    totalXp: 420,
    category: { _id: "cat-web", name: "Web Development" },
    isPublished: true,
    tags: ["HTML", "CSS", "JavaScript"],
    outcomes: [
      "Read and write basic HTML structure",
      "Style pages with CSS selectors",
      "Use JavaScript variables and conditions",
    ],
    moduleCount: 3,
    lessonCount: 12,
    enrollmentCount: 128,
    progress: 35,
  },
  {
    _id: "path-js-foundations",
    title: "JavaScript Foundations",
    slug: "javascript-foundations",
    description:
      "Practice variables, functions, arrays, and logic with immediate feedback.",
    level: "beginner",
    estimatedMinutes: 110,
    totalXp: 520,
    category: { _id: "cat-code", name: "Programming" },
    isPublished: true,
    tags: ["JavaScript", "Logic"],
    outcomes: ["Use variables", "Write small functions", "Solve array tasks"],
    moduleCount: 4,
    lessonCount: 16,
    enrollmentCount: 94,
    progress: 0,
  },
];

export const mockModules: LearningModule[] = [
  {
    _id: "module-html",
    path: "path-web-basics",
    title: "HTML First Steps",
    description: "Create the structure of a web page.",
    order: 1,
    isPublished: true,
  },
  {
    _id: "module-css",
    path: "path-web-basics",
    title: "CSS Styling",
    description: "Make page elements readable and intentional.",
    order: 2,
    requiredXpToUnlock: 80,
    isPublished: true,
  },
];

export const mockLessons: LearningLesson[] = [
  {
    _id: "lesson-html-tags",
    module: "module-html",
    title: "Meet HTML Tags",
    summary: "Identify opening tags, closing tags, and page structure.",
    order: 1,
    xpReward: 30,
    estimatedMinutes: 4,
    isPublished: true,
  },
  {
    _id: "lesson-links",
    module: "module-html",
    title: "Create Links",
    summary: "Use anchor tags to connect pages.",
    order: 2,
    xpReward: 35,
    estimatedMinutes: 5,
    isPublished: true,
  },
];

export const mockSteps: LessonStep[] = [
  {
    _id: "step-tags-intro",
    lesson: "lesson-html-tags",
    type: "explanation",
    title: "Tags wrap content",
    content:
      "HTML uses tags to describe parts of a page. A paragraph starts with <p> and ends with </p>.",
    order: 1,
  },
  {
    _id: "step-tags-choice",
    lesson: "lesson-html-tags",
    type: "multiple_choice",
    prompt: "Which tag creates a paragraph?",
    order: 2,
    tasks: [
      {
        _id: "task-paragraph",
        step: "step-tags-choice",
        type: "multiple_choice",
        question: "Choose the paragraph tag.",
        options: ["<p>", "<img>", "<body>", "<link>"],
        explanation: "<p> is the paragraph tag.",
        xpReward: 10,
      },
    ],
  },
  {
    _id: "step-tags-fill",
    lesson: "lesson-html-tags",
    type: "fill_blank",
    prompt: "Complete the closing paragraph tag.",
    content: "<p>Hello world</___>",
    order: 3,
    isCheckpoint: true,
    tasks: [
      {
        _id: "task-closing-p",
        step: "step-tags-fill",
        type: "fill_blank",
        question: "Type the missing tag name.",
        explanation: "The closing tag is </p>.",
        xpReward: 15,
      },
    ],
  },
];

export const mockGamification: UserGamification = {
  totalXp: 180,
  level: 2,
  currentStreak: 5,
  longestStreak: 9,
  hearts: 4,
  dailyGoalXp: 30,
};

export const mockEnrollments: PathEnrollment[] = [
  {
    _id: "enroll-web",
    path: mockPaths[0],
    status: "active",
    startedAt: new Date().toISOString(),
    currentLesson: mockLessons[0],
    progress: [
      {
        _id: "progress-html-tags",
        path: "path-web-basics",
        module: "module-html",
        lesson: "lesson-html-tags",
        status: "in_progress",
        score: 67,
        xpEarned: 20,
      },
    ],
  },
];
