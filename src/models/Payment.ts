import mongoose, { Document, Schema } from 'mongoose';

export interface Payment extends Document {
  userId: mongoose.Types.ObjectId;
  paymentType: 'upi' | 'paypal';
  upiId?: string;
  upiQrImage?: string;
  paypalEmail?: string;
  paypalUsername?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<Payment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    paymentType: {
      type: String,
      enum: ['upi', 'paypal'],
      required: [true, 'Payment type is required'],
    },
    upiId: {
      type: String,
      trim: true,
      sparse: true,
    },
    upiQrImage: {
      type: String,
      trim: true,
    },
    paypalEmail: {
      type: String,
      trim: true,
      sparse: true,
    },
    paypalUsername: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure either UPI or PayPal details are provided based on payment type
PaymentSchema.pre('save', function(next) {
  if (this.paymentType === 'upi' && !this.upiId) {
    const error = new Error('UPI ID is required for UPI payment type');
    return next(error);
  }
  
  if (this.paymentType === 'paypal' && !this.paypalEmail) {
    const error = new Error('PayPal email is required for PayPal payment type');
    return next(error);
  }
  
  next();
});

// Check if model already exists to prevent overwriting during hot reloads
export default mongoose.models.Payment || mongoose.model<Payment>('Payment', PaymentSchema); 