import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
export default function Welcome() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', quantity: '' });
  const [adjustData, setAdjustData] = useState({ id: '', delta: '' });
  const [editId, setEditId] = useState(null);
  const [report, setReport] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/register');
      return;
    }
    fetch('http://localhost:5000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched products:", data);
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
          console.error("Invalid product data format", data);
        }
      });
  }, [token, navigate]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdjustChange = e => {
    setAdjustData({ ...adjustData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();

    const url = editId
      ? `http://localhost:5000/api/products/${editId}`
      : 'http://localhost:5000/api/products';

    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setFormData({ name: '', price: '', quantity: '' });
        setEditId(null);
        // Reload products
        return fetch('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched products:", data);
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
          console.error("Invalid product data format", data);
        }
      });
  };
  const handleDelete = id => {
    fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() =>
        setProducts(products.filter(product => product.id !== id))
      );
  };

  const handleEdit = product => {
    setFormData({ name: product.name, price: product.price, quantity: product.quantity });
    setEditId(product.id);
  };


  const handleLogout = () => {
    localStorage.removeItem('token'); // ⬅️ Remove token
    navigate('/');               // ⬅️ Redirect to login page
  };


  const handleQuantityAdjust = e => {
    e.preventDefault();
    if (!adjustData.id || adjustData.delta === '') return;

    fetch(`http://localhost:5000/api/products/${adjustData.id}/quantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ delta: parseInt(adjustData.delta, 10) })
    })
      .then(res => res.json())
      .then(() => {
        setAdjustData({ id: '', delta: '' });

        // Refresh products
        return fetch('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched products:", data);
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
          console.error("Invalid product data format", data);
        }
      });
  };

  //report function
const fetchReport = (type) => {
  fetch(`http://localhost:5000/api/reports/${type}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setReport(data);
      } else {
        console.error("Unexpected report format:", data);
        setReport([]);
      }
    })
    .catch(err => console.error("Error fetching report:", err));
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Manager</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 mr-2"
        />
        <input
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="border p-2 mr-2"
          type="number"
        />
        <input
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="border p-2 mr-2"
          type="number"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editId ? 'Update' : 'Add'}
        </button>
      </form>

      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">${p.price}</td>
              <td className="border p-2">{p.quantity}</td>
              <td className="border p-2">
                <button onClick={() => handleEdit(p)} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleQuantityAdjust} className="mb-6">
        <select
          name="id"
          value={adjustData.id}
          onChange={handleAdjustChange}
          className="border p-2 mr-2"
        >
          <option value="">Select Product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <input
          name="delta"
          placeholder="Quantity to Add/Remove"
          value={adjustData.delta}
          onChange={handleAdjustChange}
          className="border p-2 mr-2"
          type="number"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add/Remove Quantity
        </button>
      </form> 

      <hr />
      <button onClick={handleLogout} className="mt-6 bg-red-500 text-white px-4 py-2 rounded mb-6">
        Logout
      </button>
      <hr />
      <div className="mt-6">
        <button onClick={() => fetchReport('daily')} className="bg-blue-500 text-white px-4 py-2 mr-2 rounded">
          Daily Report
        </button>
        <button onClick={() => fetchReport('weekly')} className="bg-purple-500 text-white px-4 py-2 mr-2 rounded">
          Weekly Report
        </button>
        <button
          onClick={() => fetchReport('adjustments')}
          className="bg-orange-500 text-white px-4 py-2 mt-4 rounded"
        >
          Quantity Modified Report
        </button>
      </div>

      {Array.isArray(report) && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Report</h2>
          <table className="w-full border" style={{ background: 'white' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Created</th>
                <th className="border p-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={r.id || r._id || i}>
                  <td className="border p-2">{r.id || r._id}</td>
                  <td className="border p-2">{r.name || r.product?.name || 'N/A'}</td>
                  <td className="border p-2">${r.price}</td>
                  <td className="border p-2">{r.quantity}</td>
                  <td className="border p-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}</td>
                  <td className="border p-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {Array.isArray(report) && report.length > 0 && report[0].delta !== undefined && (
  <div className="mt-6">
    <h2 className="text-xl font-bold mb-2">Quantity Modified Report</h2>
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Product ID</th>
          <th className="border p-2">Product Name</th>
          <th className="border p-2">Amount Added/Removed</th>
          <th className="border p-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {report.map((adj, i) => (
          <tr key={i}>
            <td className="border p-2">{adj.productId}</td>
            <td className="border p-2">{adj.productName}</td>
            <td className="border p-2">
              {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
            </td>
            <td className="border p-2">
              {new Date(adj.adjustedAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>
  );
}