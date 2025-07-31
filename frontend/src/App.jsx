import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome'; // Create this component

export default function App() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = (token) => {
    console.log('Logged in with token:', token);
    // Optionally set state here
     setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/welcome" /> : <LoginForm onLogin={handleLogin} />
          }
        />
        <Route
          path="/welcome"
          element={
            isLoggedIn ? <Welcome /> : <Navigate to="/" />
          }
        />
        {/* Add other routes like /register etc. */}
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  );
}

