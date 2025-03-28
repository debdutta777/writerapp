import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import NovelModel from '@/models/Novel';
import ChapterModel from '@/models/Chapter';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { mkdir } from 'fs/promises';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if novel exists and user is the author
    const novel = await NovelModel.findById(id);
    
    if (!novel) {
      return NextResponse.json({ message: 'Novel not found' }, { status: 404 });
    }

    if (novel.author.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const chapterNumber = parseInt(formData.get('chapterNumber') as string);
    
    // Get images
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('images') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Validate inputs
    if (!title || !content || isNaN(chapterNumber)) {
      return NextResponse.json(
        { message: 'Title, content, and chapter number are required' },
        { status: 400 }
      );
    }

    // Process image uploads
    const imagePaths: string[] = [];
    
    for (const imageFile of imageFiles) {
      if (!imageFile.name) continue;
      
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const filename = `${uuidv4()}-${imageFile.name.replace(/\s/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public/uploads');
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (_) {
        console.log('Directory already exists or could not be created');
      }
      
      const imagePath = join(uploadDir, filename);

      // Save file
      await writeFile(imagePath, buffer);
      imagePaths.push(`/uploads/${filename}`);
    }

    // Create chapter
    const chapter = await ChapterModel.create({
      title,
      content,
      novelId: novel._id,
      chapterNumber,
      images: imagePaths,
    });

    return NextResponse.json(
      { message: 'Chapter created successfully', chapter },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { message: 'Error creating chapter' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    // Check if novel exists
    const novel = await NovelModel.findById(id);
    
    if (!novel) {
      return NextResponse.json({ message: 'Novel not found' }, { status: 404 });
    }

    // Get chapters
    const chapters = await ChapterModel.find({ novelId: novel._id })
      .sort({ chapterNumber: 1 });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { message: 'Error fetching chapters' },
      { status: 500 }
    );
  }
} 