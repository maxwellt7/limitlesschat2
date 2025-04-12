// components/Header.js
import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">
            <Link href="/">
              Limitless Chat App
            </Link>
          </h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a 
                href="https://github.com/limitless-ai-inc/limitless-api-examples" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Limitless API
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
