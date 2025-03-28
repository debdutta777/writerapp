import DonationOptions from '@/components/payments/DonationOptions';

export default function PaymentSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payment Settings</h1>
        <p className="text-gray-600 mb-8">
          Set up your payment methods to receive donations from your readers. You can add UPI or PayPal payment options.
        </p>
        
        <DonationOptions />
      </div>
    </div>
  );
} 