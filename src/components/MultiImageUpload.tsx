'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MultiImageUploadProps {
  onImagesUpload: (imageUrls: string[]) => void;
  initialImages?: string[];
  className?: string;
}

export default function MultiImageUpload({ onImagesUpload, initialImages = [], className }: MultiImageUploadProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array
    const fileArray = Array.from(files);
    
    // Check file sizes (limit to 5MB each)
    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each file size must be less than 5MB');
        return;
      }
      
      // Only allow image files
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
    }

    setError('');
    setUploading(true);

    try {
      // Upload files one by one and collect URLs
      const uploadedUrls: string[] = [];
      
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();
        uploadedUrls.push(data.secure_url);
      }

      // Update state with new URLs
      const newImageUrls = [...imageUrls, ...uploadedUrls];
      setImageUrls(newImageUrls);
      onImagesUpload(newImageUrls);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
    onImagesUpload(newImageUrls);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <input
          type="file"
          id="images"
          className="sr-only"
          onChange={handleFileChange}
          multiple
          accept="image/*"
          disabled={uploading}
        />
        <label
          htmlFor="images"
          className="cursor-pointer inline-flex items-center rounded-md bg-white py-2 px-3 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </label>
        <p className="mt-2 text-xs text-gray-500">
          You can upload multiple images to illustrate your chapter
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imageUrls.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="relative h-24 w-full overflow-hidden rounded-md">
                <Image
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 