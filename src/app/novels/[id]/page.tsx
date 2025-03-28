'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  createdAt: string;
}

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

interface NovelDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NovelDetail({ params }: NovelDetailProps) {
  const { id } = use(params);
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const fetchNovel = useCallback(async () => {
    try {
      const res = await fetch(`/api/novels/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch novel');
      }

      setNovel(data.novel);
      setChapters(data.chapters || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNovel();
  }, [id, fetchNovel]);

  const handleDeleteNovel = async () => {
    if (!confirm('Are you sure you want to delete this novel? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/novels/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete novel');
      }

      router.push('/novels/my-novels');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href="/novels"
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to novels
          </Link>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="mt-2 text-base font-semibold text-gray-900">Novel not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The novel you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Link
              href="/novels"
              className="text-blue-600 hover:text-blue-500"
            >
              ← Back to novels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = session?.user?.id === novel.author._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/novels"
          className="text-blue-600 hover:text-blue-500"
        >
          ← Back to novels
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="relative w-full h-96 md:h-[400px] overflow-hidden rounded-lg shadow-md">
            {novel.coverImage ? (
              <Image
                src={novel.coverImage}
                alt={novel.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg
              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            {novel.views} views
          </div>

          {isAuthor && (
            <div className="mt-6 space-y-3">
              <Link
                href={`/novels/${novel._id}/edit`}
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Edit Novel
              </Link>
              <Link
                href={`/novels/${novel._id}/chapters/create`}
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Add Chapter
              </Link>
              <button
                onClick={handleDeleteNovel}
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Delete Novel
              </button>
            </div>
          )}
        </div>

        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
          <p className="mt-2 text-sm text-gray-600">By {novel.author.name}</p>
          
          <div className="mt-6 prose">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="text-gray-700">{novel.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chapters</h2>
            
            {chapters.length === 0 ? (
              <div className="text-center py-8 border border-gray-200 rounded-md">
                <p className="text-gray-500">
                  You haven&apos;t created any chapters yet. Start by creating your first chapter!
                </p>
                {isAuthor && (
                  <p className="mt-2 text-sm text-gray-600">
                    Your novel doesn&apos;t have any chapters yet. Click the &quot;Add Chapter&quot; button to start adding content.
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {chapters.map((chapter) => (
                    <li key={chapter._id}>
                      <Link
                        href={`/novels/${novel._id}/chapters/${chapter._id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 flex items-center">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Chapter {chapter.chapterNumber}: {chapter.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(chapter.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-5 flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 