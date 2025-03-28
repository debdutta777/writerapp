'use client';

import { useState, useEffect } from 'react';
import UpiPaymentForm from './UpiPaymentForm';
import PaypalPaymentForm from './PaypalPaymentForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DonationOptions() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    upi: { upiId?: string; upiQrImage?: string };
    paypal: { paypalEmail?: string; paypalUsername?: string };
  }>({
    upi: {},
    paypal: {}
  });

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/payments/settings');
        const data = await response.json();
        
        if (response.ok) {
          setPaymentData({
            upi: {
              upiId: data.upiPayment?.upiId || '',
              upiQrImage: data.upiPayment?.upiQrImage || ''
            },
            paypal: {
              paypalEmail: data.paypalPayment?.paypalEmail || '',
              paypalUsername: data.paypalPayment?.paypalUsername || ''
            }
          });
        } else {
          setError(data.message || 'Failed to load payment settings');
        }
      } catch (err) {
        setError('An error occurred while fetching payment settings');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentSettings();
  }, [session]);

  const handleUpiSubmit = async (data: { upiId: string; upiQrImage?: string }) => {
    try {
      // Clear previous messages and set loading state
      setError('');
      setSuccessMessage('');
      setIsSubmitting(true);
      
      const response = await fetch('/api/payments/upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save UPI details');
      }

      // Success - update local state
      setPaymentData(prev => ({
        ...prev,
        upi: { upiId: data.upiId, upiQrImage: data.upiQrImage }
      }));
      
      // Show success message
      setSuccessMessage('UPI payment details saved successfully!');
      
      // Refresh the page data
      router.refresh();
    } catch (err: any) {
      console.error('Error saving UPI details:', err);
      setError(err.message || 'An error occurred while saving UPI details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment Settings</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-md shadow-sm">
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
      
      <div className="mb-6">
        <div className="border-b border-gray-300">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upi')}
              className={`py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'upi'
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
              }`}
            >
              UPI
            </button>
            <button
              onClick={() => setActiveTab('paypal')}
              className={`py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'paypal'
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
              }`}
            >
              PayPal
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'upi' ? (
          <UpiPaymentForm
            initialUpiId={paymentData.upi.upiId}
            initialUpiQrImage={paymentData.upi.upiQrImage}
            onSubmit={handleUpiSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <PaypalPaymentForm
            paypalEmail={paymentData.paypal.paypalEmail}
            paypalUsername={paymentData.paypal.paypalUsername}
            onSuccess={() => router.refresh()}
          />
        )}
      </div>
    </div>
  );
} 