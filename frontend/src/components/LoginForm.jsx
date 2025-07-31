import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ⬅️ Import useNavigate

export default function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate(); // ⬅️ Get navigate function

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          onLogin(data.token); // Call onLogin
          navigate('/welcome'); // ⬅️ Redirect to Welcome page
        } else {
          alert('Login failed');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        alert('Something went wrong during login.');
      });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow w-full max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border mb-3" />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border mb-3" />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Login</button>
      <p>Not registered?<Link to="/register" className='m-2 text-blue-500  p-3'>Register here</Link></p>
    </form>
  );
}