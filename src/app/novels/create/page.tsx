'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

// Predefined genres matching the reader-side application
const GENRES = ['Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Adventure', 'Horror', 'Thriller', 'History'];

export default function CreateNovel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: _session, status } = useSession();

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!title || !description) {
        throw new Error('Title and description are required');
      }

      if (selectedGenres.length === 0) {
        throw new Error('Please select at least one genre');
      }

      // Create data object to send
      const novelData = {
        title,
        description,
        coverImage,
        genres: selectedGenres,
      };

      const res = await fetch('/api/novels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novelData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create novel');
      }

      router.push(`/novels/${data.novel._id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Novel</h1>
        <p className="text-sm text-gray-300 mt-2">
          Fill in the details below to create your new novel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Genres
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRES.map((genre) => (
              <div key={genre} className="flex items-center">
                <input
                  id={`genre-${genre}`}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreToggle(genre)}
                />
                <label htmlFor={`genre-${genre}`} className="ml-2 block text-sm text-gray-200">
                  {genre}
                </label>
              </div>
            ))}
          </div>
          {selectedGenres.length === 0 && (
            <p className="mt-1 text-xs text-red-400">Please select at least one genre</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cover Image
          </label>
          <ImageUpload
            onImageUpload={(url) => setCoverImage(url)}
            className="mt-1"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-900 p-4">
            <div className="flex">
              <div className="text-sm text-red-200">{error}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Novel'}
          </button>
        </div>
      </form>
    </div>
  );
} 