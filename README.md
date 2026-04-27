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

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-333333?style=for-the-badge)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

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

