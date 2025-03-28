'use client';

import { useState } from 'react';
import Image from 'next/image';

interface UpiPaymentFormProps {
  initialUpiId?: string;
  initialUpiQrImage?: string;
  onSubmit: (data: { upiId: string; upiQrImage?: string }) => void;
  isSubmitting: boolean;
}

export default function UpiPaymentForm({
  initialUpiId = '',
  initialUpiQrImage = '',
  onSubmit,
  isSubmitting
}: UpiPaymentFormProps) {
  const [upiId, setUpiId] = useState(initialUpiId);
  const [upiQrImage, setUpiQrImage] = useState(initialUpiQrImage);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      setError('');
      
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/payments/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload QR code image');
      }

      const data = await response.json();
      setUpiQrImage(data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload QR code image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError('');
    
    if (!upiId.trim()) {
      setError('UPI ID is required');
      return;
    }
    
    // UPI ID format validation
    const upiIdPattern = /^[\w\.\-]+@[\w\-]+$/;
    if (!upiIdPattern.test(upiId)) {
      setError('Please enter a valid UPI ID (e.g., name@upi)');
      return;
    }
    
    // Submit the form data
    onSubmit({ upiId, upiQrImage });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          UPI ID <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="upiId"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm"
            required
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter your UPI ID in the format: yourname@upi
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          UPI QR Code Image (Optional)
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <label className="cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <span>{uploadingImage ? 'Uploading...' : 'Upload QR Image'}</span>
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png"
              onChange={handleQrImageUpload}
              disabled={uploadingImage}
            />
          </label>
          
          {upiQrImage && (
            <div className="relative h-20 w-20 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
              <Image
                src={upiQrImage}
                alt="UPI QR Code"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setUpiQrImage('')}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Upload your UPI QR code image for readers to scan. Max size: 2MB.
        </p>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || !upiId.trim()}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save UPI Details'}
        </button>
      </div>
    </form>
  );
} 