import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from "react-hot-toast";

const BlogViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const profileImage = user?.profileImage
    ? `${import.meta.env.VITE_API_BASE_URL_IMAGE}${user.profileImage}`
    : "https://via.placeholder.com/80";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/blogs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("resss", response);
        setBlog(response.data.blog);
        setError(null);
        fetchComments();
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog. It may have been deleted or you don't have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("response",response);
      if (response.data.success && response.data.comments) {
        const formattedComments = response.data.comments.flatMap(comment => {
          const mainComment = {...comment};
          delete mainComment.replies;
          const replies = comment.replies?.map(reply => ({
            ...reply,
            parentComment: comment._id
          })) || [];
          return [mainComment, ...replies];
        });
        setComments(formattedComments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      toast.error("Failed to load comments");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const commentData = {
        content: commentText,
        parentCommentId: replyTo
      };
      await axios.post(`${API_BASE_URL}/comments/${id}`, commentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchComments();
      setCommentText('');
      setReplyTo(null);
      toast.success('Comment added successfully!');
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error(err.response?.data?.message || "Failed to add comment. Please try again.");
    }
  };

  const handleReplyToComment = (commentId) => {
    setReplyTo(commentId);
    document.getElementById('commentInput').focus();
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Blog not found"}
        </div>
        <button
          onClick={handleBack}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Toaster position="top-right" />

      <header className="bg-teal-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 bg-white text-teal-600 p-1 rounded-full hover:bg-teal-100 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Blog Viewer</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white mr-2"
            />
            <span className="hidden md:inline">{user?.name || 'User'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{blog.title}</h1>
            <div className="flex items-center text-slate-600 mb-6">
              <span className="mr-4">Posted on {new Date(blog.createdAt).toLocaleDateString()}</span>
              {blog.createdAt !== blog.updatedAt && (
                <span>(Updated: {new Date(blog.updatedAt).toLocaleDateString()})</span>
              )}
            </div>
            {blog.image && (
              <div className="mb-6">
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL_IMAGE}${blog.image}`} 
                  alt={blog.title}
                  className="w-full h-96 object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-10">
            <p className="whitespace-pre-line text-slate-700 text-lg leading-relaxed">{blog.description}</p>
          </div>

          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Comments ({comments.length})</h2>
            
            <div className="mb-8">
              {replyTo && (
                <div className="mb-2 flex items-center justify-between bg-teal-50 p-2 rounded text-sm">
                  <span>Replying to comment</span>
                  <button 
                    onClick={() => setReplyTo(null)}
                    className="text-slate-500 hover:text-slate-700"
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
                  className="flex-1 border rounded-l py-3 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-r disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className={`bg-slate-50 p-4 rounded-lg ${comment.parentComment ? 'ml-10 border-l-4 border-teal-300' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <img 
                          src={comment.user?.profileImage ? `${import.meta.env.VITE_API_BASE_URL_IMAGE}${comment.user.profileImage}` : "https://via.placeholder.com/40"} 
                          alt="User" 
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <span className="font-medium text-slate-800">{comment.user?.name || 'User'}</span>
                          <p className="text-xs text-slate-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700">{comment.content}</p>
                    <button
                      onClick={() => handleReplyToComment(comment._id)}
                      className="text-sm text-teal-600 mt-2 hover:text-teal-800"
                    >
                      Reply
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogViewer;
