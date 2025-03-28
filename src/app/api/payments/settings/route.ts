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
      console.log('No user ID in session:', session);
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }
    
    // Ensure the ID is a valid MongoDB ObjectId
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(session.user.id);
      console.log('Valid MongoDB ObjectId:', userId);
    } catch (err) {
      console.error('Invalid MongoDB ObjectId format:', session.user.id, err);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    try {
      await connectDB();
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    console.log(`Fetching payment settings for user: ${userId}`);
    
    try {
      // Get user's payment methods
      const userPayments = await Payment.find({ 
        userId: userId
      });
      
      console.log(`Found ${userPayments.length} payment methods for user ${userId}`);
      
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
    } catch (dbOperationError) {
      console.error('Database operation error:', dbOperationError);
      return NextResponse.json(
        { error: 'Failed to retrieve from database: ' + (dbOperationError instanceof Error ? dbOperationError.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to load payment settings. Please try again.' },
      { status: 500 }
    );
  }
} 