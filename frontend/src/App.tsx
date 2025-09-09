import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // This assumes the backend is running on port 8000.
    // This may need to be adjusted based on the actual backend setup.
    fetch('http://localhost:8000/api/v1/courses')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Assuming the API returns an object with a 'data' property
        // that contains the array of courses
        if (data && data.data) {
          setCourses(data.data);
        } else {
          // Handle cases where the data is directly an array
          setCourses(data);
        }
      })
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Our Courses</h1>
        <p>A simple and modern frontend displaying courses from the backend.</p>
      </header>
      <div className="course-list">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <div key={course._id} className="course-card">
              <div className="course-card-header">
                <h2>{course.title}</h2>
              </div>
              <div className="course-card-body">
                <p><strong>Category:</strong> {course.category}</p>
                <p className="price">${course.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No courses available at the moment. Please check back later.</p>
        )}
      </div>
    </div>
  );
}

export default App;
