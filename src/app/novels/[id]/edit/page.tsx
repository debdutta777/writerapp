'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MultiImageUpload from '@/components/MultiImageUpload';

interface Novel {
  _id: string;
  title: string;
  description: string;
  genre: string;
  coverImage?: string;
  author: {
    _id: string;
    name: string;
  };
}

export default function EditNovel({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch novel details
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    async function fetchNovel() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/novels/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch novel');
        }
        
        const data = await response.json();
        setNovel(data);
        setTitle(data.title);
        setDescription(data.description);
        setGenre(data.genre || 'Fantasy'); // Default to Fantasy if no genre
        setCoverImage(data.coverImage || '');
        
        if (data.coverImage) {
          setImages([data.coverImage]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching novel:', error);
        setError('Failed to load novel details. Please try again.');
        setIsLoading(false);
      }
    }
    
    fetchNovel();
  }, [params.id, router, status]);

  // Check if user is the author
  useEffect(() => {
    if (novel && session && novel.author._id !== session.user.id) {
      setError('You are not authorized to edit this novel');
      router.push(`/novels/${params.id}`);
    }
  }, [novel, session, router, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !genre) {
      setError('Title, description, and genre are required');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/novels/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          genre,
          coverImage: images.length > 0 ? images[0] : '',
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update novel');
      }
      
      router.push(`/novels/${params.id}`);
    } catch (error) {
      console.error('Error updating novel:', error);
      setError('Failed to update novel. Please try again.');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Novel</h1>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Genre*
            </label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
              required
            >
              <option value="">Select Genre</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Thriller">Thriller</option>
              <option value="Horror">Horror</option>
              <option value="Adventure">Adventure</option>
              <option value="Historical Fiction">Historical Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Image
            </label>
            <MultiImageUpload
              images={images}
              setImages={setImages}
              maxImages={1}
              label="Choose cover image (optional)"
            />
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <Link
              href={`/novels/${params.id}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Updating...
                </>
              ) : (
                'Update Novel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 