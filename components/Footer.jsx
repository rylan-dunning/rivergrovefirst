import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="container mx-auto px-10 pb-4 mt-12 border-t border-blue-400 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-white text-sm">© {currentYear} Rivergrove 1st Ward. All Rights Reserved.</p>
        </div>
        
        <div className="flex space-x-4">
          <Link href="/">
            <span className="text-white text-sm hover:text-pink-600 cursor-pointer transition duration-300">Home</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;