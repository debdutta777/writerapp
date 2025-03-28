import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import NovelModel from '@/models/Novel';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/[...nextauth]/route';
import { mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const coverImageFile = formData.get('coverImage') as File | null;

    // Validate inputs
    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Process image upload
    let coverImagePath = null;
    if (coverImageFile) {
      const bytes = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const filename = `${uuidv4()}-${coverImageFile.name.replace(/\s/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public/uploads');
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        console.log('Directory already exists or could not be created');
      }
      
      const imagePath = join(uploadDir, filename);

      // Save file
      await writeFile(imagePath, buffer);
      coverImagePath = `/uploads/${filename}`;
    }

    // Connect to database
    await connectDB();

    // Create novel
    const novel = await NovelModel.create({
      title,
      description,
      coverImage: coverImagePath,
      author: session.user.id,
      views: 0,
    });

    return NextResponse.json(
      { message: 'Novel created successfully', novel },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating novel:', error);
    return NextResponse.json(
      { message: 'Error creating novel' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('authorId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (authorId) {
      query.author = authorId;
    }

    // Get novels
    const novels = await NovelModel.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await NovelModel.countDocuments(query);

    return NextResponse.json({
      novels,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching novels:', error);
    return NextResponse.json(
      { message: 'Error fetching novels' },
      { status: 500 }
    );
  }
} 