import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Payment from '@/models/Payment';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { paypalEmail, paypalUsername } = await request.json();
    
    if (!paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal email is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find existing PayPal payment or create a new one
    const existingPayment = await Payment.findOne({
      userId: session.user.id,
      paymentType: 'paypal'
    });
    
    if (existingPayment) {
      // Update existing payment
      existingPayment.paypalEmail = paypalEmail;
      existingPayment.paypalUsername = paypalUsername || existingPayment.paypalUsername;
      await existingPayment.save();
      
      return NextResponse.json({
        message: 'PayPal payment details updated successfully',
        payment: {
          paypalEmail: existingPayment.paypalEmail,
          paypalUsername: existingPayment.paypalUsername
        }
      });
    } else {
      // Create new payment
      const newPayment = new Payment({
        userId: session.user.id,
        paymentType: 'paypal',
        paypalEmail,
        paypalUsername,
        isActive: true
      });
      
      await newPayment.save();
      
      return NextResponse.json({
        message: 'PayPal payment details saved successfully',
        payment: {
          paypalEmail: newPayment.paypalEmail,
          paypalUsername: newPayment.paypalUsername
        }
      });
    }
  } catch (error) {
    console.error('Error saving PayPal payment details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 