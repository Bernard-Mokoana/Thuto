# Thuto - MERN Stack Education Platform

A full-stack, Online learning platform built with the MERN stack (MongoDB, Express.js, React, Node.js). This project powers user authentication, course creation and enrollment, lesson management, progress tracking, and certificate generation.

---

## 🚀 Features

### Backend

- 🔐 **Authentication:** Secure JWT (JSON Web Token) authentication with cookie-based sessions.
- 🧑‍🎓 **Role-Based Access Control:** Differentiated permissions for Admins, Tutors, and Students.
- 📚 **Course Management:** Full CRUD (Create, Read, Update, Delete) functionality for courses, including details like title, description, category, and pricing.
- 📖 **Lesson Management:** Tutors can create and manage lessons within their courses, including video content and articles.
- 📝 **Assessments & Submissions:** Functionality for creating assessments and handling student submissions.
- ✅ **Grading System:** Tutors can grade student submissions.
- 🎓 **Certificate Generation:** Automatically generate certificates upon course completion.
- 📈 **Reporting & Analytics:** Powerful reporting using MongoDB Aggregation pipelines to get insights on:
  - Average grade per course
  - Submission counts per lesson
  - Top-performing students
- 💳 **Transactions:** Secure transaction handling for course enrollments.

### Frontend

- **⚛️ Modern UI:** A responsive and interactive user interface built with React and Vite.
- **🌐 Type-Safe:** Developed with TypeScript for robust and maintainable code.
- **🖥️ Component-Based Architecture:** Organized and reusable components for a scalable frontend.

---

## 🛠️ Tech Stack

### Backend

| Category      | Technology                               |
|---------------|------------------------------------------|
| Runtime       | Node.js                                  |
| Framework     | Express.js                               |
| Database      | MongoDB with Mongoose                    |
| Authentication| JWT (jsonwebtoken) & `cookie-parser`     |
| Testing       | Jest & Supertest                         |
| Miscellaneous | `cors`, `dotenv`, `bcrypt`                 |

### Frontend

| Category      | Technology                               |
|---------------|------------------------------------------|
| Library       | React                                    |
| Build Tool    | Vite                                     |
| Language      | TypeScript                               |

---

## 📂 Project Structure

```
.
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── config
│   │   └── utils
│   ├── tests
│   ├── app.js
│   ├── index.js
│   └── package.json
└── frontend
    ├── src
    │   ├── assets
    │   └── App.tsx
    ├── public
    ├── index.html
    └── package.json
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18.x or higher recommended)
- npm
- MongoDB instance (local or a cloud service like MongoDB Atlas)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory. You can duplicate the `.env.example` if it exists, and then fill in the necessary values:
    ```
    PORT=5000
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    ```
4.  **Run the backend server:**
    ```bash
    npm start
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```

---

## 🧪 Testing

The backend API is tested using Jest and Supertest. To run the test suite:

1. Navigate to the backend directory.
2. Run the test command:
   ```bash
   npm test
   ```

