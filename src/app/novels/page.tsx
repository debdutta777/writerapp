'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Novel {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  author: {
    _id: string;
    name: string;
  };
  views: number;
  createdAt: string;
}

export default function NovelsPage() {
  const { data: session } = useSession();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNovels() {
      try {
        setLoading(true);
        const response = await fetch('/api/novels');
        const data = await response.json();
        
        if (response.ok) {
          setNovels(data);
        } else {
          setError(data.error || 'Failed to fetch novels');
        }
      } catch (err) {
        setError('An error occurred while fetching novels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNovels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Novels</h1>
        {session && (
          <Link
            href="/novels/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create Novel
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {novels.length === 0 && !loading && !error ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Novels Yet</h2>
          <p className="text-gray-600 mb-6">
            Be the first to share your creative writing with the world!
          </p>
          {session ? (
            <Link
              href="/novels/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition inline-block"
            >
              Create Your First Novel
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition inline-block"
            >
              Login to Get Started
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map((novel) => (
            <div
              key={novel._id}
              className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-lg"
            >
              <Link href={`/novels/${novel._id}`}>
                <div className="relative h-48 w-full">
                  {novel.coverImage ? (
                    <Image
                      src={novel.coverImage}
                      alt={novel.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Cover</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{novel.title}</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    By {novel.author.name} · {new Date(novel.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 line-clamp-3">{novel.description}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {novel.views} views
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 