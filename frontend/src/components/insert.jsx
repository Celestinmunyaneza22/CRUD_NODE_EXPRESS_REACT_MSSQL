import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
function Insert() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [formData, setFormData] = useState({ id: '', name: '', age: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch data
  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then((res) => res.json())
      .then((rows) => {
        setData(rows);
        if (rows.length > 0) {
          setColumns(Object.keys(rows[0]));
        }
      });
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  
    // Basic frontend validation
  // if (!formData.id.trim() || !formData.name.trim() || !formData.age) {
  //   alert("All fields are required.");
  //   return;
  // }

  // if (isNaN(formData.age) || parseInt(formData.age) <= 0) {
  //   alert("Age must be a positive number.");
  //   return;
  // }

  // if (!/^\d+$/.test(formData.id)) {
  //   alert("ID must be a valid number.");
  //   return;
  // }


  const url = isEditMode
    ? `http://localhost:5000/api/data/${formData.id}`
    : 'http://localhost:5000/api/data';

  const method = isEditMode ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
    .then(res => res.json())
    .then(response => {
      // if (response.error) {
      //   alert(response.error); // Show backend validation error
      //   return;
      // }
      alert(response.message || (isEditMode ? "Updated" : "Inserted"));

      // Refresh data
      return fetch('http://localhost:5000/api/data')
        .then(res => res.json())
        .then(rows => {
          setData(rows);
          if (rows.length > 0) {
            setColumns(Object.keys(rows[0]));
          }
          setFormData({ id: '', name: '', age: '' }); // Clear form
          setIsEditMode(false); // Reset mode
        });
    })
    .catch(error => {
      console.error(isEditMode ? "Update failed" : "Insert failed", error);
    });
};

    const handleDelete = (id) => {
  if (window.confirm("Are you sure?")) {
    fetch(`http://localhost:5000/api/data/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchData());
  }
};

const handleEdit = (row) => {
  setFormData({ ...row });
  setIsEditMode(true);
};

  return (
    <>
    <Link to="/" className='text-blue-500 m-4 p-3'>Home</Link>
    <Link to="/users" className='text-blue-500 m-4 p-3'>View Users</Link>
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Add Record</h2>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Id:</label>
          <input
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Age:</label>
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
            type="number"
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </div>

<button
  type="submit"
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  {isEditMode ? 'Update' : 'Submit'}
</button>

{isEditMode && (
  <button
    type="button"
    onClick={() => {
      setIsEditMode(false);
      setFormData({ id: '', name: '', age: '' });
    }}
    className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
  >
    Cancel
  </button>
)}
      </form>

      <h2 className="text-2xl font-bold mb-4">Users Data Table</h2>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm text-gray-800">
                    {row[col]}
                  </td>
                  
                ))}
                <td className="px-4 py-2">
                <button onClick={() => handleEdit(row)} className="text-blue-500 hover:underline mr-2">Edit</button>
                <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

export default Insert;