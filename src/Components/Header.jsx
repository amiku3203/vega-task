// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-teal-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">BlogApp</Link>
        <nav className="space-x-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/blogs" className="hover:underline">Blogs</Link>
          <Link to="/blogs/add" className="hover:underline">Add Blog</Link>
          <Link to="/signup" className="hover:underline">Sign Up</Link>
          <Link to="/" className="hover:underline">Login</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
