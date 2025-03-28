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
      const response = await fetch('/api/payments/upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save UPI details');
      }

      setPaymentData(prev => ({
        ...prev,
        upi: { upiId: data.upiId, upiQrImage: data.upiQrImage }
      }));
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving UPI details');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Payment Settings</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upi')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upi'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              UPI
            </button>
            <button
              onClick={() => setActiveTab('paypal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'paypal'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              PayPal
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-6">
        {activeTab === 'upi' ? (
          <UpiPaymentForm
            initialUpiId={paymentData.upi.upiId}
            initialUpiQrImage={paymentData.upi.upiQrImage}
            onSubmit={handleUpiSubmit}
            isSubmitting={false}
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