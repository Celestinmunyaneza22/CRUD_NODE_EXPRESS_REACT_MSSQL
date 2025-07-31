import React, { useState } from 'react';
import { Link } from 'react-router-dom';
export default function RegisterForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => alert(data.message));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow w-full max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border mb-3" />
      <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border mb-3" />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} className="w-full p-2 border mb-3" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
      <p>already registered?<Link to="/" className='m-2 text-blue-500 p-3'>Login here</Link></p>
    </form>
  );
}
