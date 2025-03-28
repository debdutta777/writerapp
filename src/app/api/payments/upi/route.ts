import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Payment from '@/models/Payment';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    // Get session with auth options to ensure proper ID handling
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }
    
    // Make sure we have a user ID
    if (!session.user.id) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    const { upiId, upiQrImage } = await request.json();
    
    if (!upiId) {
      return NextResponse.json(
        { error: 'UPI ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Log for debugging
    console.log(`Attempting to save UPI details for user: ${session.user.id}, UPI ID: ${upiId}`);
    
    // Find existing UPI payment or create a new one
    const existingPayment = await Payment.findOne({
      userId: session.user.id,
      paymentType: 'upi'
    });
    
    if (existingPayment) {
      // Update existing payment
      existingPayment.upiId = upiId;
      if (upiQrImage) {
        existingPayment.upiQrImage = upiQrImage;
      }
      await existingPayment.save();
      
      return NextResponse.json({
        message: 'UPI payment details updated successfully',
        payment: {
          upiId: existingPayment.upiId,
          upiQrImage: existingPayment.upiQrImage
        }
      });
    } else {
      // Create new payment
      const newPayment = new Payment({
        userId: session.user.id,
        paymentType: 'upi',
        upiId,
        upiQrImage,
        isActive: true
      });
      
      await newPayment.save();
      
      return NextResponse.json({
        message: 'UPI payment details saved successfully',
        payment: {
          upiId: newPayment.upiId,
          upiQrImage: newPayment.upiQrImage
        }
      });
    }
  } catch (error) {
    // Enhanced error logging
    console.error('Error saving UPI payment details:', error);
    
    // Provide more specific error messages
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save UPI details. Please try again.' },
      { status: 500 }
    );
  }
} 