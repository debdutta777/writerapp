import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import NovelModel from '@/models/Novel';
import ChapterModel from '@/models/Chapter';
import { authOptions } from '../../../auth/[...nextauth]/route';

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

    // Parse JSON data
    const { title, content, chapterNumber, images } = await req.json();

    // Validate inputs
    if (!title || !content || isNaN(chapterNumber)) {
      return NextResponse.json(
        { message: 'Title, content, and chapter number are required' },
        { status: 400 }
      );
    }

    // Create chapter
    const chapter = await ChapterModel.create({
      title,
      content,
      novelId: novel._id,
      chapterNumber,
      images: images || [],
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