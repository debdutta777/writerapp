import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

// GET /api/payments - Get user's payment methods
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const payments = await Payment.find({ userId: session.user.id, isActive: true });
    
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment method
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { paymentType, upiId, upiQrImage, paypalEmail, paypalUsername } = data;

    // Validate required fields based on payment type
    if (paymentType === 'upi' && !upiId) {
      return NextResponse.json(
        { error: 'UPI ID is required for UPI payment method' },
        { status: 400 }
      );
    }

    if (paymentType === 'paypal' && !paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal email is required for PayPal payment method' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new payment method
    const newPayment = new Payment({
      userId: session.user.id,
      paymentType,
      ...(paymentType === 'upi' && { upiId, upiQrImage }),
      ...(paymentType === 'paypal' && { paypalEmail, paypalUsername }),
    });

    await newPayment.save();
    
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments - Mark all payment methods as inactive
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Mark all payment methods as inactive
    await Payment.updateMany(
      { userId: session.user.id, isActive: true },
      { isActive: false }
    );
    
    return NextResponse.json({ message: 'All payment methods deactivated' });
  } catch (error) {
    console.error('Error deactivating payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate payment methods' },
      { status: 500 }
    );
  }
} 