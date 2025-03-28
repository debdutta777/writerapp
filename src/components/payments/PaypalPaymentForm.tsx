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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700">
          PayPal Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="paypalEmail"
          name="paypalEmail"
          value={formData.paypalEmail}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="your.email@example.com"
          required
        />
      </div>
      
      <div>
        <label htmlFor="paypalUsername" className="block text-sm font-medium text-gray-700">
          PayPal Username (optional)
        </label>
        <input
          type="text"
          id="paypalUsername"
          name="paypalUsername"
          value={formData.paypalUsername}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="@yourusername"
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save PayPal Details'}
      </button>
    </form>
  );
} 