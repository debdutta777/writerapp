import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Payment from '@/models/Payment';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    console.log(`Fetching payment settings for user: ${session.user.id}`);
    
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
      { error: 'Failed to load payment settings. Please try again.' },
      { status: 500 }
    );
  }
} 