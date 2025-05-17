import React from 'react';

const Footer = () => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '180px',
        padding: '8px 12px',
        textAlign: 'center',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '1rem',
        backgroundColor: '#1a202c',  
        color: '#f6ad55',  
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        userSelect: 'none',
        zIndex: 1000,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        letterSpacing: '0.05em',
      }}
    >
      by Amit <span style={{ color: '#f56565' }}>❤️</span>
    </div>
  );
};

export default Footer;
