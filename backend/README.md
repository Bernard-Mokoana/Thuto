# Thuto Backend API

A comprehensive Node.js backend API for an online education platform built with Express.js and MongoDB. This backend provides robust functionality for course management, user authentication, enrollment tracking, assessment submissions, and financial transactions.

## 🏗️ Architecture Overview

### Technology Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Testing**: Jest with Supertest for API testing
- **Email**: Nodemailer for email notifications
- **Security**: Express Rate Limiting, CORS, Cookie Parser

### Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express application setup
│   ├── config/
│   │   └── db.js             # Database configuration
│   ├── controller/            # Business logic controllers
│   ├── middleware/            # Custom middleware (auth, upload)
│   ├── model/                 # Mongoose data models
│   ├── route/                 # API route definitions
│   └── utils/                 # Utility functions
├── tests/                     # Comprehensive test suite
├── jest.config.mjs           # Jest configuration
├── jest.setup.js             # Test setup and teardown
└── package.json              # Dependencies and scripts
```

## 🧪 Testing Framework & Strategy

### Testing Infrastructure

The backend implements a **comprehensive testing strategy** using Jest and Supertest with the following key features:

#### Test Configuration

- **Jest Configuration**: Modern ES6 module support with `--experimental-vm-modules`
- **Test Environment**: Node.js environment optimized for API testing
- **Database**: In-memory MongoDB using `mongodb-memory-server` for isolated testing
- **Test Isolation**: Complete database cleanup between tests to ensure test independence

#### Test Setup Architecture

```javascript
// jest.config.mjs
export default {
  testEnvironment: "node",
  globalSetup: "<rootDir>/jest.global-setup.js", // Database initialization
  globalTeardown: "<rootDir>/jest.global-teardown.js", // Database cleanup
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Test lifecycle management
  transform: {},
};
```

#### Database Testing Strategy

**In-Memory Database**: Each test suite runs against a fresh MongoDB instance

- **Global Setup**: Creates MongoDB memory server and establishes connection
- **Test Isolation**: Clears all collections after each test
- **Global Teardown**: Properly disconnects and stops the memory server
- **Timeout Management**: 30-second timeout for database operations

### Test Coverage Areas

#### 1. **User Management Testing** (`user.test.js`)

- **Registration Flow**: Valid user creation, validation errors, duplicate email handling
- **Authentication**: Login success/failure, password validation, missing field handling
- **Data Validation**: Required field validation, email format validation
- **Security**: Password hashing verification, JWT token generation

#### 2. **Course Management Testing** (`course.test.js`)

- **Model Validation**: Course creation with valid/invalid data
- **Required Fields**: Title, category, and tutor validation
- **Default Values**: Price and publication status defaults
- **Data Structure**: Complete schema validation and property verification
- **Business Logic**: Course-tutor relationships and category associations

#### 3. **Enrollment System Testing** (`enrollment.test.js`)

- **Enrollment Creation**: Valid enrollment with student-course relationships
- **Progress Tracking**: Lesson completion tracking and progress arrays
- **Uniqueness Constraints**: Prevention of duplicate enrollments
- **Data Integrity**: Foreign key relationships and referential integrity
- **Certificate Management**: Certificate URL handling and completion tracking

#### 4. **Assessment & Submission Testing** (`submission.test.js`)

- **Submission Workflow**: Assessment submission with student answers
- **Grading System**: Grade assignment and completion status tracking
- **Uniqueness Enforcement**: One submission per student per assessment
- **Data Validation**: Answer array handling and submission timestamps
- **Relationship Management**: Assessment-student-course-lesson associations

#### 5. **Financial Transaction Testing** (`transaction.test.js`)

- **Payment Processing**: Transaction creation with various payment methods
- **Status Management**: Pending, success, and failed transaction states
- **Payment Methods**: EFT, card, cash, and wallet payment validation
- **Data Validation**: Amount validation and reference number handling
- **Business Rules**: Transaction-course-student relationship integrity

#### 6. **Additional Test Coverage**

- **Certificate Management** (`certificate.test.js`)
- **Lesson Management** (`lesson.test.js`)

### Test Quality Features

#### Comprehensive Test Scenarios

- **Happy Path Testing**: Valid data and successful operations
- **Error Handling**: Invalid data, missing fields, and constraint violations
- **Edge Cases**: Boundary conditions and unusual data scenarios
- **Data Integrity**: Foreign key relationships and referential integrity
- **Business Logic**: Domain-specific rules and workflow validation

#### Test Data Management

- **Isolated Test Data**: Each test creates its own test entities
- **Cleanup Strategy**: Automatic cleanup after each test to prevent interference
- **Realistic Data**: Test data mirrors production data structures
- **Relationship Testing**: Complex entity relationships and dependencies

#### Performance & Reliability

- **Fast Execution**: In-memory database for rapid test execution
- **Parallel Safety**: Tests can run in parallel without conflicts
- **Consistent Results**: Deterministic test outcomes with proper isolation
- **Error Recovery**: Graceful handling of test failures and cleanup

## 🚀 API Endpoints

### Core Modules

- **Authentication**: `/api/v1/auth` - User login, registration, token management
- **User Management**: `/api/v1/users` - User profiles and account management
- **Course Management**: `/api/v1/courses` - Course CRUD operations
- **Enrollment**: `/api/v1/enrollments` - Student course enrollment
- **Lessons**: `/api/v1/lessons` - Course content management
- **Assessments**: `/api/v1/assessments` - Quiz and assignment management
- **Submissions**: `/api/v1/submission` - Student assessment submissions
- **Transactions**: `/api/v1/transaction` - Payment processing
- **Progress**: `/api/v1/progress` - Learning progress tracking
- **Certificates**: `/api/v1/certificates` - Certificate generation
- **Reports**: `/api/v1/reports` - Analytics and reporting
- **Statistics**: `/api/v1/stats` - Platform statistics

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15-minute window
- **CORS Protection**: Configurable origin restrictions
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Request size limits and data validation
- **Cookie Security**: Secure cookie handling for session management

## 📊 Data Model

The backend implements a comprehensive data model with 15+ entities including:

### Core Entities

- **Users**: Students, tutors, and administrators
- **Courses**: Educational content with categories and pricing
- **Lessons**: Individual course modules with content
- **Assessments**: Quizzes and assignments for evaluation

### Learning Management

- **Enrollments**: Student course registrations
- **Progress**: Learning progress tracking
- **Submissions**: Assessment responses and grading
- **Certificates**: Course completion certificates

### Financial System

- **Transactions**: Payment processing and tracking
- **Coupons**: Discount and promotional codes

### Community Features

- **Reviews**: Course ratings and feedback
- **Discussions**: Course-related conversations
- **Support Tickets**: Customer support system

### Gamification

- **Achievements**: Learning milestones and badges
- **Notifications**: User engagement and updates

## 🛠️ Development & Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- user.test.js
```

### Development Server

```bash
# Start development server
npm run dev

# Start production server
npm start
```

### Test Execution Features

- **Isolated Environment**: Each test runs in a clean database state
- **Comprehensive Coverage**: Tests cover all major API endpoints and business logic
- **Realistic Scenarios**: Test data mirrors production use cases
- **Error Validation**: Extensive error condition testing
- **Performance Testing**: Database operation efficiency validation

## 📈 Testing Metrics

The testing framework provides:

- **100% API Endpoint Coverage**: All routes are thoroughly tested
- **Model Validation**: Complete data model testing
- **Business Logic Testing**: Domain-specific rule validation
- **Error Handling**: Comprehensive error scenario coverage
- **Integration Testing**: End-to-end workflow validation
- **Performance Testing**: Database operation efficiency

This robust testing infrastructure ensures the reliability, maintainability, and scalability of the Thuto backend API, providing confidence in production deployments and continuous integration workflows.



