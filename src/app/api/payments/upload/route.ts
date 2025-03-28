import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG and PNG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds the limit of 2MB' },
        { status: 400 }
      );
    }

    // Generate a unique folder path for each user's payment QR codes
    const folderPath = `payments/${session.user.id}/${uuidv4()}`;
    
    // Upload image to Cloudinary or your preferred storage
    const imageUrl = await uploadImage(file, folderPath);
    
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading payment QR code:', error);
    return NextResponse.json(
      { error: 'Failed to upload payment QR code' },
      { status: 500 }
    );
  }
} 