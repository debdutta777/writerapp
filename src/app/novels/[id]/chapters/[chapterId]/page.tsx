'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';

interface ChapterDetailProps {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

interface Chapter {
  _id: string;
  title: string;
  content: string;
  chapterNumber: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Novel {
  _id: string;
  title: string;
  author: {
    _id: string;
    name: string;
  };
}

export default function ChapterDetail({ params }: ChapterDetailProps) {
  const { id, chapterId } = use(params);
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [nextChapter, setNextChapter] = useState<string | null>(null);
  const [prevChapter, setPrevChapter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const fetchChapterAndNovel = useCallback(async () => {
    try {
      // Fetch chapter
      const chapterRes = await fetch(`/api/novels/${id}/chapters/${chapterId}`);
      const chapterData = await chapterRes.json();

      if (!chapterRes.ok) {
        throw new Error(chapterData.message || 'Failed to fetch chapter');
      }

      setChapter(chapterData.chapter);

      // Fetch novel
      const novelRes = await fetch(`/api/novels/${id}`);
      const novelData = await novelRes.json();

      if (!novelRes.ok) {
        throw new Error(novelData.message || 'Failed to fetch novel');
      }

      setNovel(novelData.novel);

      // Set up next and previous chapter navigation
      const chapters = novelData.chapters || [];
      const currentIndex = chapters.findIndex((c: { _id: string }) => c._id === chapterId);
      
      if (currentIndex > 0) {
        setPrevChapter(chapters[currentIndex - 1]._id);
      } else {
        setPrevChapter(null);
      }

      if (currentIndex < chapters.length - 1) {
        setNextChapter(chapters[currentIndex + 1]._id);
      } else {
        setNextChapter(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [id, chapterId]);

  useEffect(() => {
    fetchChapterAndNovel();
  }, [id, chapterId, fetchChapterAndNovel]);

  const handleDeleteChapter = async () => {
    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/novels/${id}/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete chapter');
      }

      router.push(`/novels/${id}`);
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

  if (error || !chapter || !novel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Chapter not found'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href={`/novels/${id}`}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to novel
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = session?.user?.id === novel.author._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <Link
          href={`/novels/${id}`}
          className="text-blue-600 hover:text-blue-500"
        >
          ← Back to {novel.title}
        </Link>

        {isAuthor && (
          <div className="flex space-x-2">
            <Link
              href={`/novels/${id}/chapters/${chapterId}/edit`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={handleDeleteChapter}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900">
          Chapter {chapter.chapterNumber}: {chapter.title}
        </h1>
        <p className="text-sm text-gray-600">
          Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}
        </p>

        {/* Split content into paragraphs */}
        <div className="mt-8">
          {chapter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Display images */}
        {chapter.images && chapter.images.length > 0 && (
          <div className="mt-12 space-y-6">
            {chapter.images.map((image, index) => (
              <div key={index} className="flex justify-center">
                <div className="relative w-full max-w-2xl h-96">
                  <Image
                    src={image}
                    alt={`Illustration ${index + 1} for Chapter ${chapter.chapterNumber}`}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chapter navigation */}
        <div className="mt-12 flex justify-between">
          {prevChapter ? (
            <Link
              href={`/novels/${id}/chapters/${prevChapter}`}
              className="text-blue-600 hover:text-blue-500"
            >
              ← Previous Chapter
            </Link>
          ) : (
            <span></span>
          )}
          {nextChapter && (
            <Link
              href={`/novels/${id}/chapters/${nextChapter}`}
              className="text-blue-600 hover:text-blue-500"
            >
              Next Chapter →
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}