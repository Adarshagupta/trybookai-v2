'use client';

import { useState } from 'react';
import { BookGeneratorForm } from '@/components/book-generator-form';
import { BookOutlineDisplay } from '@/components/book-outline';
import { BookOutline } from '@/types/book';

export default function Home() {
  const [bookOutline, setBookOutline] = useState<BookOutline | null>(null);

  const handleOutlineGenerated = (outline: BookOutline) => {
    setBookOutline(outline);
  };

  const handleReset = () => {
    setBookOutline(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookify</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate complete books with AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {bookOutline ? (
          <BookOutlineDisplay outline={bookOutline} onReset={handleReset} />
        ) : (
          <div className="max-w-2xl mx-auto">
            <BookGeneratorForm onOutlineGenerated={handleOutlineGenerated} />
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Powered by Gemini AI</span>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Created with Next.js and TailwindCSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
