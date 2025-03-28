import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import NovelModel from '@/models/Novel';
import ChapterModel from '@/models/Chapter';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { mkdir } from 'fs/promises';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await context.params;
    await connectDB();

    // Check if novel exists
    const novel = await NovelModel.findById(id);
    
    if (!novel) {
      return NextResponse.json({ message: 'Novel not found' }, { status: 404 });
    }

    // Get the chapter
    const chapter = await ChapterModel.findOne({
      _id: chapterId,
      novelId: id,
    });

    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { message: 'Error fetching chapter' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await context.params;
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

    // Check if chapter exists
    const chapter = await ChapterModel.findOne({
      _id: chapterId,
      novelId: id,
    });

    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const chapterNumber = parseInt(formData.get('chapterNumber') as string);
    
    // Get new images
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('newImages') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Keep old images if specified
    const keepImages = formData.getAll('keepImages[]') as string[];

    // Validate inputs
    if (!title || !content || isNaN(chapterNumber)) {
      return NextResponse.json(
        { message: 'Title, content, and chapter number are required' },
        { status: 400 }
      );
    }

    // Process new image uploads
    const newImagePaths: string[] = [];
    
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
      newImagePaths.push(`/uploads/${filename}`);
    }

    // Update chapter
    chapter.title = title;
    chapter.content = content;
    chapter.chapterNumber = chapterNumber;
    chapter.images = [...keepImages, ...newImagePaths];
    await chapter.save();

    return NextResponse.json(
      { message: 'Chapter updated successfully', chapter }
    );
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { message: 'Error updating chapter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await context.params;
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

    // Delete the chapter
    await ChapterModel.findOneAndDelete({
      _id: chapterId,
      novelId: id,
    });

    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { message: 'Error deleting chapter' },
      { status: 500 }
    );
  }
} 