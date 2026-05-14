# Thuto - Gamified Learning ERD

## Target Backend Schema

This ERD describes the redesign: learning paths contain modules, modules contain short lessons, lessons contain ordered interactive steps, and steps can include tasks. Student completion is tracked through attempts, progress, XP, streaks, and achievements instead of video watching.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String firstName
        String lastName
        String email UK
        String password
        String role "Student|Admin|Tutor"
        Boolean isVerified
        String profileImage
        Date createdAt
        Date updatedAt
    }

    CATEGORY {
        ObjectId _id PK
        String name UK
        String slug UK
        String description
        String icon
        String color
        Boolean isActive
        ObjectId parentCategory FK
        Number sortOrder
        Date createdAt
        Date updatedAt
    }

    LEARNING_PATH {
        ObjectId _id PK
        String title
        String slug UK
        ObjectId category FK
        String description
        String level "beginner|intermediate|advanced"
        String thumbnail
        Number estimatedMinutes
        Number totalXp
        String[] tags
        String[] outcomes
        Boolean isPublished
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }

    LEARNING_MODULE {
        ObjectId _id PK
        ObjectId path FK
        String title
        String description
        Number order
        Number requiredXpToUnlock
        Boolean isPublished
        Date createdAt
        Date updatedAt
    }

    LEARNING_LESSON {
        ObjectId _id PK
        ObjectId module FK
        String title
        String summary
        Number order
        Number xpReward
        Number estimatedMinutes
        Boolean isPublished
        Date createdAt
        Date updatedAt
    }

    LESSON_STEP {
        ObjectId _id PK
        ObjectId lesson FK
        String type "explanation|multiple_choice|fill_blank|code|matching|ordering"
        String title
        String prompt
        String content
        Number order
        Boolean isCheckpoint
        Date createdAt
        Date updatedAt
    }

    TASK {
        ObjectId _id PK
        ObjectId step FK
        String type "multiple_choice|fill_blank|code|matching|ordering"
        String question
        String instructions
        String[] options
        Mixed correctAnswer
        String explanation
        Number xpReward
        Number maxAttempts
        Number sortOrder
        Date createdAt
        Date updatedAt
    }

    PATH_ENROLLMENT {
        ObjectId _id PK
        ObjectId student FK
        ObjectId path FK
        String status "active|completed|paused"
        Date startedAt
        Date completedAt
        ObjectId currentLesson FK
        Date createdAt
        Date updatedAt
    }

    USER_PROGRESS {
        ObjectId _id PK
        ObjectId student FK
        ObjectId path FK
        ObjectId module FK
        ObjectId lesson FK
        ObjectId step FK
        String status "not_started|in_progress|completed"
        Number score
        Number xpEarned
        Date lastAccessedAt
        Date completedAt
        Date createdAt
        Date updatedAt
    }

    TASK_ATTEMPT {
        ObjectId _id PK
        ObjectId student FK
        ObjectId task FK
        ObjectId lesson FK
        Mixed submittedAnswer
        Boolean isCorrect
        Number xpEarned
        Date attemptedAt
        Date createdAt
        Date updatedAt
    }

    USER_GAMIFICATION {
        ObjectId _id PK
        ObjectId student FK
        Number totalXp
        Number level
        Number currentStreak
        Number longestStreak
        Date lastActivityDate
        Number hearts
        Date heartsRefilledAt
        Number dailyGoalXp
        Date createdAt
        Date updatedAt
    }

    ACHIEVEMENT {
        ObjectId _id PK
        String name UK
        String description
        String icon
        String type
        Object criteria
        Number points
        Boolean isActive
        String rarity "common|rare|epic|legendary"
        Date createdAt
        Date updatedAt
    }

    USER_ACHIEVEMENT {
        ObjectId _id PK
        ObjectId user FK
        ObjectId achievement FK
        Date earnedAt
        Object metadata
        Date createdAt
        Date updatedAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK
        String title
        String message
        String type "learning|system|achievement"
        Boolean isRead
        String actionUrl
        String priority "low|medium|high"
        Date expiresAt
        Date createdAt
        Date updatedAt
    }

    USER ||--o{ LEARNING_PATH : creates
    USER ||--o{ PATH_ENROLLMENT : starts
    USER ||--o{ USER_PROGRESS : tracks
    USER ||--o{ TASK_ATTEMPT : submits
    USER ||--|| USER_GAMIFICATION : owns
    USER ||--o{ USER_ACHIEVEMENT : earns
    USER ||--o{ NOTIFICATION : receives

    CATEGORY ||--o{ LEARNING_PATH : groups
    CATEGORY ||--o{ CATEGORY : contains

    LEARNING_PATH ||--o{ LEARNING_MODULE : contains
    LEARNING_PATH ||--o{ PATH_ENROLLMENT : enrolled_by
    LEARNING_PATH ||--o{ USER_PROGRESS : tracked_by

    LEARNING_MODULE ||--o{ LEARNING_LESSON : contains
    LEARNING_MODULE ||--o{ USER_PROGRESS : tracked_by

    LEARNING_LESSON ||--o{ LESSON_STEP : contains
    LEARNING_LESSON ||--o{ USER_PROGRESS : tracked_by
    LEARNING_LESSON ||--o{ TASK_ATTEMPT : attempted_in

    LESSON_STEP ||--o{ TASK : asks
    LESSON_STEP ||--o{ USER_PROGRESS : current_step

    TASK ||--o{ TASK_ATTEMPT : attempted

    ACHIEVEMENT ||--o{ USER_ACHIEVEMENT : awarded_as
```

## Migration Notes

- `course` becomes `learningPath`.
- `lesson` is split into `learningLesson`, `lessonStep`, and `task`.
- `videoUrl`, `materials`, and video `duration` are removed from the target learning model.
- `enrollment` becomes `pathEnrollment`.
- Passive watch progress becomes task-driven `userProgress`.
- `submission` and `assessment` are replaced by `taskAttempt` for interactive exercises.
- `userGamification` stores XP, hearts, streaks, and daily goals.

## Key Indexes

```ts
// Learning path discovery
{ category: 1, isPublished: 1 }
{ level: 1, isPublished: 1 }
{ title: "text", description: "text", tags: "text" }

// Ordered content
{ path: 1, order: 1 } // unique on learning modules
{ module: 1, order: 1 } // unique on lessons
{ lesson: 1, order: 1 } // unique on lesson steps
{ step: 1, sortOrder: 1 } // task order

// Student learning state
{ student: 1, path: 1 } // unique path enrollment
{ student: 1, lesson: 1 } // unique progress record
{ student: 1, path: 1, status: 1 }
{ student: 1, task: 1, attemptedAt: -1 }

// Gamification
{ student: 1 } // unique user gamification record
{ totalXp: -1 }
{ currentStreak: -1 }
```

## Business Rules

- A student can enroll in a learning path once.
- A module, lesson, and step order must be unique within its parent.
- Task answers are hidden by default with `select: false`.
- A completed task can award XP once in the service layer.
- Wrong answers can reduce hearts in the service layer.
- Streaks update from daily completed learning activity.
- A path is complete when all required lessons in that path are complete.
- Achievements are awarded once per student and achievement.
