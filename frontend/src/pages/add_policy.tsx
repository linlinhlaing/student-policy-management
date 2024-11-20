import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLogin } from '../utils/authUtils';



const AddPolicy = () => {

  var navigateTo = useNavigate();
  
  useEffect(() => {
    if (!isLogin()) {
      navigateTo('/');
    }
  }, [navigateTo]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    academic_year: ''
  });
  const [showModal, setShowModal] = useState(false);
  

  const categories = ['General', 'Food', 'Library', 'Meditation', 'Education', 'Visa & Travel', 'Students Lounge'];
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, description, category, date, academic_year } = formData;

    if (!title || !description || !category || !date || !academic_year) {
      alert('All fields are required.');
      return;
    }

    const token = localStorage.getItem('token');
    const timestamp = Math.floor(new Date(date).getTime()/ 1000).toString().slice(0, 10);
    try {
      const response = await fetch('http://54.174.249.167:3000/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, date: timestamp })
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(true);
      }
      console.log(data);
    } catch (error) {
      console.error('There was an error creating the policy!', error);
    }
  };

  const handleModalClose = () => {
    
    setShowModal(false);
    navigateTo('/');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Academic Year</label>
          <select
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select an academic year</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-4 rounded shadow-md">
            <p>Policy created successfully!</p>
            <button
              onClick={handleModalClose}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPolicy;
