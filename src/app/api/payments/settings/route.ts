import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Payment from '@/models/Payment';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Get user's payment methods
    const userPayments = await Payment.find({ 
      userId: session.user.id
    });
    
    const upiPayment = userPayments.find(payment => payment.paymentType === 'upi');
    const paypalPayment = userPayments.find(payment => payment.paymentType === 'paypal');
    
    return NextResponse.json({
      upiPayment: upiPayment ? {
        upiId: upiPayment.upiId,
        upiQrImage: upiPayment.upiQrImage
      } : null,
      paypalPayment: paypalPayment ? {
        paypalEmail: paypalPayment.paypalEmail,
        paypalUsername: paypalPayment.paypalUsername
      } : null
    });
    
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 