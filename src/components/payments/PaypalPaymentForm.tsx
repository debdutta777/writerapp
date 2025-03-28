'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PaypalPaymentFormProps {
  paypalEmail?: string;
  paypalUsername?: string;
  onSuccess?: () => void;
}

export default function PaypalPaymentForm({ 
  paypalEmail = '', 
  paypalUsername = '', 
  onSuccess 
}: PaypalPaymentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    paypalEmail: paypalEmail,
    paypalUsername: paypalUsername
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError('You must be logged in');
      return;
    }

    if (!formData.paypalEmail) {
      setError('PayPal email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');
      
      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paypalEmail: formData.paypalEmail,
          paypalUsername: formData.paypalUsername,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccessMessage('PayPal details saved successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-800">
          PayPal Email <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          id="paypalEmail"
          name="paypalEmail"
          value={formData.paypalEmail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-800 py-2 px-3 sm:text-sm"
          placeholder="your.email@example.com"
          required
        />
      </div>
      
      <div>
        <label htmlFor="paypalUsername" className="block text-sm font-medium text-gray-800">
          PayPal Username (optional)
        </label>
        <input
          type="text"
          id="paypalUsername"
          name="paypalUsername"
          value={formData.paypalUsername}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-800 py-2 px-3 sm:text-sm"
          placeholder="@yourusername"
        />
        <p className="mt-1 text-xs text-gray-600">
          Enter your PayPal username if you have a custom one
        </p>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border-l-4 border-red-500">
          {error}
        </div>
      )}
      
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save PayPal Details'}
        </button>
      </div>
    </form>
  );
} 