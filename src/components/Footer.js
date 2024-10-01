import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center">
      <span className="text-orange-500 text-2xl font-bold">CK</span> 
      <span className="text-white-500 text-2xl font-bold mr-4">POOL</span>
        <p className="text-sm">
          Pool code and pool operated and created by Con Kolivas, creator of cgminer and ckpool.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
