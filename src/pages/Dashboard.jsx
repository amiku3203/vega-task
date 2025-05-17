import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from "react-hot-toast";
const Dashboard = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState('');
  const [currentBlog, setCurrentBlog] = useState({
    id: null,
    title: '',
    description: '',
    image: '',
    createdAt: '',
    updatedAt: ''
  });

  // User data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  
  const token = localStorage.getItem("token");
  const profileImage = user?.profileImage
    ? `${import.meta.env.VITE_API_BASE_URL_IMAGE}${user.profileImage}`
    : "https://via.placeholder.com/80";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blogs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("response", response);
      setBlogs(response.data.blogs);
      setError(null);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    navigate('/');
  };

  const handleAddBlog = () => {
    setCurrentBlog({
      id: null,
      title: '',
      description: '',
      image: ''
    });
    setBlogImageFile(null);
    setBlogImagePreview('');
    setShowAddForm(true);
  };

  const handleEditBlog = (blog) => {
    setCurrentBlog({
      id: blog._id,
      title: blog.title,
      description: blog.description,
      image: blog.image
    });
    setBlogImagePreview(blog.image ? `${import.meta.env.VITE_API_BASE_URL_IMAGE}${blog.image}` : '');
    setBlogImageFile(null);
    setShowEditForm(true);
  };

  const handleViewDetails = async (blog) => {
    setCurrentBlog({
      id: blog._id,
      title: blog.title,
      description: blog.description,
      image: blog.image,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt
    });
    setShowDetailsModal(true);
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`${API_BASE_URL}/blogs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Refresh blogs after deletion
        fetchBlogs();
      } catch (err) {
        console.error("Error deleting blog:", err);
        alert("Failed to delete blog. Please try again.");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
 

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append('title', currentBlog.title);
    formData.append('description', currentBlog.description);

    if (blogImageFile) {
      formData.append('image', blogImageFile);
    }

    if (showAddForm) {
      // Add new blog
      const response = await axios.post(`${API_BASE_URL}/blogs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Blog added successfully!');
      setShowAddForm(false);
    } else if (showEditForm) {
      // Update blog
      const response = await axios.put(`${API_BASE_URL}/blogs/${currentBlog.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Blog updated successfully!');
      setShowEditForm(false);
    }

    // Refresh blogs after success
    fetchBlogs();

  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      toast.error(`Error: ${err.response.data.message}`);
    } else {
      toast.error("Failed to save blog. Please try again.");
    }
    console.error("Error saving blog:", err);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBlog({ ...currentBlog, [name]: value });
  };

  // Comment functionality
  const fetchComments = async (blogId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blogs/${blogId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleViewComments = (blog) => {
    setSelectedBlogId(blog._id);
    fetchComments(blog._id);
    setShowCommentSection(true);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      const commentData = {
        content: commentText,
        parentComment: replyTo
      };
      
      await axios.post(`${API_BASE_URL}/blogs/${selectedBlogId}/comments`, commentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh comments
      fetchComments(selectedBlogId);
      setCommentText('');
      setReplyTo(null);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleReplyToComment = (commentId) => {
    setReplyTo(commentId);
    // Focus on comment input
    document.getElementById('commentInput').focus();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-800">
       <Toaster position="top-right" />
      
       <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
  <h1 className="text-2xl font-bold text-white"> Dashboard</h1>
  <div className="flex items-center space-x-4">
    <div className="flex items-center">
      <img
        src={profileImage}
        alt="Profile"
        className="w-10 h-10 rounded-full border-2 border-white mr-2"
      />
      <span className="hidden md:inline text-white">{user?.name || 'User'}</span>
    </div>
    <button
      onClick={handleLogout}
      className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors duration-200"
    >
      Logout
    </button>
  </div>
</header>

<main className="flex-1 p-6 max-w-7xl mx-auto w-full">
  {/* Dashboard Header */}
  <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
    <h2 className="text-2xl font-semibold text-gray-800">Your Blogs</h2>
    <div className="flex gap-3">
      <button
        onClick={handleAddBlog}
        className="bg-orange-600 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add New Blog
      </button>

      <button
        onClick={() => navigate("/blogs")}
        className="bg-gray-800 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-gray-900 transition-colors duration-200 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 3a2 2 0 00-2 2v1a1 1 0 001 1h1v9a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1V5a2 2 0 00-2-2H4zm12 4v9H6V7h10z" />
        </svg>
        View All Blogs
      </button>
    </div>
  </div>

  {/* Error & Loader */}
  {error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  )}

  {loading ? (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  ) : (
    <>
      {/* Table for Desktop */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden hidden md:block">
        {blogs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No blogs found. Create your first blog!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className="px-6 py-4">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL_IMAGE}${blog.image}`}
                        alt={blog.title}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">{blog.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {blog.description.length > 100 ? `${blog.description.substring(0, 100)}...` : blog.description}
                    </td>
                    <td className="px-6 py-4">{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex flex-wrap gap-2">
                      <button onClick={() => navigate(`/blogs/${blog._id}`)} className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-500 rounded hover:bg-blue-200">View</button>
                      <button onClick={() => handleEditBlog(blog)} className="px-3 py-1 bg-green-100 text-green-700 border border-green-500 rounded hover:bg-green-200">Edit</button>
                      <button onClick={() => handleDeleteBlog(blog._id)} className="px-3 py-1 bg-red-100 text-red-700 border border-red-500 rounded hover:bg-red-200">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cards for Mobile */}
      <div className="md:hidden space-y-4">
        {blogs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No blogs found. Create your first blog!</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL_IMAGE}${blog.image}`}
                  alt={blog.title}
                  className="h-16 w-16 object-cover rounded"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{blog.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{blog.description.length > 100 ? `${blog.description.substring(0, 100)}...` : blog.description}</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => navigate(`/blogs/${blog._id}`)} className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-500 rounded hover:bg-blue-200">View</button>
                <button onClick={() => handleEditBlog(blog)} className="px-3 py-1 bg-green-100 text-green-700 border border-green-500 rounded hover:bg-green-200">Edit</button>
                <button onClick={() => handleDeleteBlog(blog._id)} className="px-3 py-1 bg-red-100 text-red-700 border border-red-500 rounded hover:bg-red-200">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )}
</main>

     

      {/* Blog Form Modal - Add and Edit */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {showAddForm ? 'Add New Blog' : 'Edit Blog'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentBlog.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                  Blog Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required={showAddForm}
                />
                {blogImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={blogImagePreview} 
                      alt="Preview" 
                      className="h-40 object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentBlog.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {showAddForm ? 'Add Blog' : 'Update Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold">{currentBlog.title}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <img 
                src={`${import.meta.env.VITE_API_BASE_URL_IMAGE}${currentBlog.image}`} 
                alt={currentBlog.title} 
                className="w-full h-64 object-cover rounded mb-4"
              />
              <span className="text-sm text-gray-500">
                Created: {new Date(currentBlog.createdAt).toLocaleString()}
              </span>
              {currentBlog.updatedAt && currentBlog.updatedAt !== currentBlog.createdAt && (
                <span className="text-sm text-gray-500 ml-2">
                  (Updated: {new Date(currentBlog.updatedAt).toLocaleString()})
                </span>
              )}
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{currentBlog.description}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditBlog(currentBlog);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit This Blog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section Modal */}
      {showCommentSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Comments</h2>
              <button
                onClick={() => {
                  setShowCommentSection(false);
                  setReplyTo(null);
                  setCommentText('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Comments list */}
            <div className="mb-4 max-h-80 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className={`bg-gray-50 p-3 rounded ${comment.parentComment ? 'ml-8 border-l-2 border-orange-300' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <img 
                            src={comment.user?.profileImage ? `${import.meta.env.VITE_API_BASE_URL_IMAGE}${comment.user.profileImage}` : "https://via.placeholder.com/40"} 
                            alt="User" 
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="font-medium text-sm">{comment.user?.name || 'User'}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                      <button
                        onClick={() => handleReplyToComment(comment._id)}
                        className="text-xs text-orange-600 mt-1 hover:text-orange-800"
                      >
                        Reply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add comment form */}
            <div>
              {replyTo && (
                <div className="mb-2 flex items-center justify-between bg-orange-50 p-2 rounded text-sm">
                  <span>Replying to comment</span>
                  <button 
                    onClick={() => setReplyTo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex">
                <input
                  id="commentInput"
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 border rounded-l py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-r disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Dashboard;