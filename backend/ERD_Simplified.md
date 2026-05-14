# EduConnectSa - Simplified Gamified ERD

## Core Flow

```mermaid
graph TB
    USER[USER]
    CATEGORY[CATEGORY]
    PATH[LEARNING PATH]
    MODULE[MODULE]
    LESSON[LESSON]
    STEP[LESSON STEP]
    TASK[TASK]
    ENROLLMENT[PATH ENROLLMENT]
    PROGRESS[USER PROGRESS]
    ATTEMPT[TASK ATTEMPT]
    GAME[USER GAMIFICATION]
    ACHIEVEMENT[ACHIEVEMENT]
    USER_ACHIEVEMENT[USER ACHIEVEMENT]
    NOTIFICATION[NOTIFICATION]

    CATEGORY -->|groups| PATH
    USER -->|creates| PATH

    PATH -->|contains| MODULE
    MODULE -->|contains| LESSON
    LESSON -->|contains| STEP
    STEP -->|may ask| TASK

    USER -->|starts| ENROLLMENT
    PATH -->|has| ENROLLMENT

    USER -->|tracks| PROGRESS
    PATH -->|tracked in| PROGRESS
    MODULE -->|tracked in| PROGRESS
    LESSON -->|tracked in| PROGRESS
    STEP -->|current step| PROGRESS

    USER -->|submits| ATTEMPT
    TASK -->|receives| ATTEMPT
    LESSON -->|attempted in| ATTEMPT

    USER -->|has| GAME
    USER -->|earns| USER_ACHIEVEMENT
    ACHIEVEMENT -->|awarded as| USER_ACHIEVEMENT
    USER -->|receives| NOTIFICATION

    classDef content fill:#e1f5fe
    classDef learning fill:#f3e5f5
    classDef game fill:#e8f5e8
    classDef user fill:#fff3e0

    class CATEGORY,PATH,MODULE,LESSON,STEP,TASK content
    class ENROLLMENT,PROGRESS,ATTEMPT learning
    class GAME,ACHIEVEMENT,USER_ACHIEVEMENT game
    class USER,NOTIFICATION user
```

## Cardinality Summary

| Relationship | Cardinality | Description |
| --- | --- | --- |
| User to Learning Path | 1:N | One tutor/admin can create many paths |
| Category to Learning Path | 1:N | One category groups many paths |
| Learning Path to Module | 1:N | One path contains ordered modules |
| Module to Lesson | 1:N | One module contains ordered lessons |
| Lesson to Lesson Step | 1:N | One lesson contains bite-sized steps |
| Lesson Step to Task | 1:N | One step can have one or more tasks |
| User to Path Enrollment | 1:N | One student can start many paths |
| User to User Progress | 1:N | One student has progress across lessons |
| User to Task Attempt | 1:N | One student can submit many attempts |
| User to User Gamification | 1:1 | One student has one XP/streak record |
| Achievement to User Achievement | 1:N | One achievement can be earned by many students |

## Main Backend Models

| Model file | Purpose |
| --- | --- |
| `learningPath.ts` | Top-level learning track, replacing marketplace courses |
| `learningModule.ts` | Ordered sections inside a path |
| `learningLesson.ts` | Short lesson units without videos |
| `lessonStep.ts` | One screen or prompt inside a lesson |
| `task.ts` | Interactive question or coding exercise |
| `pathEnrollment.ts` | Student enrollment in a path |
| `userProgress.ts` | Student completion state per lesson |
| `taskAttempt.ts` | Student answer submissions |
| `userGamification.ts` | XP, level, hearts, streaks, daily goal |

## Business Rules

- Lessons are completed by finishing interactive tasks, not by watching videos.
- Task `correctAnswer` is hidden by default and should only be selected in validation services.
- XP, hearts, streaks, and achievements should be updated by backend services after attempts.
- A student can only have one active enrollment record per path.
- A student can only have one progress record per lesson.
- Publishing should happen from top to bottom: path, module, lesson, step, task.
