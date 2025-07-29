import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
function Admin() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then((response) => response.json())
      .then((rows) => {
        setData(rows);
        if (rows.length > 0) {
          setColumns(Object.keys(rows[0])); // Get table headers from keys
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <>
    <Link to="/" className='text-blue-500 m-4 p-3'>Home</Link>
    <Link to="/users" className='text-blue-500 m-4 p-3'>View Users</Link>
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Admin Page</h2>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-800">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

export default Admin;