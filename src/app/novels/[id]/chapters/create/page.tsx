'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import MultiImageUpload from '@/components/MultiImageUpload';

interface NovelChapterCreateProps {
  params: Promise<{
    id: string;
  }>;
}

interface Novel {
  _id: string;
  title: string;
}

interface Chapter {
  chapterNumber: number;
}

export default function CreateChapter({ params }: NovelChapterCreateProps) {
  // Unwrap the params Promise with React.use
  const { id } = use(params);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: _session, status } = useSession();

  const fetchNovel = useCallback(async () => {
    try {
      const res = await fetch(`/api/novels/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch novel');
      }

      setNovel(data.novel);
      
      // Get the highest chapter number to suggest the next one
      if (data.chapters && data.chapters.length > 0) {
        const highest = Math.max(...data.chapters.map((c: Chapter) => c.chapterNumber));
        setChapterNumber((highest + 1).toString());
      } else {
        setChapterNumber('1');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    if (status === 'authenticated') {
      fetchNovel();
    }
  }, [status, id, router, fetchNovel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || submitting) return;
    
    setSubmitting(true);
    setError('');

    try {
      if (!title || !content || !chapterNumber) {
        throw new Error('All fields are required');
      }

      // Create data to send
      const chapterData = {
        title,
        content,
        chapterNumber: parseInt(chapterNumber),
        images
      };

      const res = await fetch(`/api/novels/${id}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapterData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create chapter');
      }

      router.push(`/novels/${id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Novel not found or you don't have permission to add chapters
              </p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/novels/${id}`}
          className="text-blue-600 hover:text-blue-500"
        >
          ← Back to {novel.title}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Add Chapter to &quot;{novel.title}&quot;
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-700">
            Chapter Number
          </label>
          <input
            type="number"
            id="chapterNumber"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Chapter Title
          </label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Images (Optional)
          </label>
          <MultiImageUpload
            onImagesUpload={(urls) => setImages(urls)}
            className="mt-1"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Link
            href={`/novels/${id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Adding Chapter...' : 'Add Chapter'}
          </button>
        </div>
      </form>
    </div>
  );
} 