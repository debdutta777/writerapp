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

    const { upiId, upiQrImage } = await request.json();
    
    if (!upiId) {
      return NextResponse.json(
        { error: 'UPI ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Connecting to MongoDB for user: ${session.user.id}`);
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
    
    console.log(`Attempting to save UPI details for user: ${session.user.id}, UPI ID: ${upiId}`);
    
    try {
      // Find existing UPI payment or create a new one
      const existingPayment = await Payment.findOne({
        userId: userId,
        paymentType: 'upi'
      });
      
      if (existingPayment) {
        console.log(`Found existing UPI payment for user: ${session.user.id}`);
        // Update existing payment
        existingPayment.upiId = upiId;
        if (upiQrImage) {
          existingPayment.upiQrImage = upiQrImage;
        }
        await existingPayment.save();
        console.log('Updated existing UPI payment successfully');
        
        return NextResponse.json({
          message: 'UPI payment details updated successfully',
          payment: {
            upiId: existingPayment.upiId,
            upiQrImage: existingPayment.upiQrImage
          }
        });
      } else {
        console.log(`No existing UPI payment found for user: ${session.user.id}, creating new`);
        // Create new payment
        const newPayment = new Payment({
          userId: userId,
          paymentType: 'upi',
          upiId,
          upiQrImage,
          isActive: true
        });
        
        const savedPayment = await newPayment.save();
        console.log('Created new UPI payment successfully:', savedPayment._id);
        
        return NextResponse.json({
          message: 'UPI payment details saved successfully',
          payment: {
            upiId: newPayment.upiId,
            upiQrImage: newPayment.upiQrImage
          }
        });
      }
    } catch (dbOperationError) {
      console.error('Database operation error:', dbOperationError);
      return NextResponse.json(
        { error: 'Failed to save to database: ' + (dbOperationError instanceof Error ? dbOperationError.message : 'Unknown error') },
        { status: 500 }
      );
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