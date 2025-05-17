import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const profileImage = user?.profileImage
    ? `${import.meta.env.VITE_API_BASE_URL_IMAGE}${user.profileImage}`
    : "https://via.placeholder.com/80";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAllBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/blogs/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBlogs(response.data.blogs);
        setError(null);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-white">All Blogs</h1>
        <div className="flex items-center">
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {blogs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No blogs found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform hover:scale-105">
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL_IMAGE}${blog.image}`} 
                      alt={blog.title}
                      className="w-full h-48 object-contain"
                    />
                    <div className="p-4">
                      <h2 className="text-xl font-semibold mb-2 text-black">{blog.title}</h2>
                      <div className="flex items-center mb-3">
                        <img 
                          src={blog.user?.profileImage ? `${import.meta.env.VITE_API_BASE_URL_IMAGE}${blog.user.profileImage}` : "https://via.placeholder.com/30"} 
                          alt="Author" 
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-600">{blog.user?.name || 'Anonymous'}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {blog.description.length > 150 
                          ? `${blog.description.substring(0, 150)}...` 
                          : blog.description}
                      </p>
                      <Link 
                        to={`/blogs/${blog._id}`} 
                        className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors duration-200"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AllBlogs;
