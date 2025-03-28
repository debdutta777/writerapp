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
    
    const { upiId, upiQrImage } = await request.json();
    
    if (!upiId) {
      return NextResponse.json(
        { error: 'UPI ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
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
    console.error('Error saving UPI payment details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 