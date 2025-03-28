import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import NovelModel from '@/models/Novel';
import ChapterModel from '@/models/Chapter';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const novel = await NovelModel.findById(id).populate('author', 'name');
    
    if (!novel) {
      return NextResponse.json({ message: 'Novel not found' }, { status: 404 });
    }

    // Increment view count
    novel.views += 1;
    await novel.save();

    // Get chapters
    const chapters = await ChapterModel.find({ novelId: novel._id })
      .sort({ chapterNumber: 1 })
      .select('title chapterNumber createdAt');

    return NextResponse.json({ novel, chapters });
  } catch (error) {
    console.error('Error fetching novel:', error);
    return NextResponse.json(
      { message: 'Error fetching novel' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const novel = await NovelModel.findById(id);
    
    if (!novel) {
      return NextResponse.json({ message: 'Novel not found' }, { status: 404 });
    }

    // Check if user is the author
    if (novel.author.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      );
    }

    novel.title = title;
    novel.description = description;
    await novel.save();

    return NextResponse.json({ message: 'Novel updated successfully', novel });
  } catch (error) {
    console.error('Error updating novel:', error);
    return NextResponse.json(
      { message: 'Error updating novel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const novel = await NovelModel.findById(id);
    
    if (!novel) {
      return NextResponse.json({ message: 'Novel not found' }, { status: 404 });
    }

    // Check if user is the author
    if (novel.author.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Delete all chapters
    await ChapterModel.deleteMany({ novelId: novel._id });
    
    // Delete the novel
    await NovelModel.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Novel deleted successfully' });
  } catch (error) {
    console.error('Error deleting novel:', error);
    return NextResponse.json(
      { message: 'Error deleting novel' },
      { status: 500 }
    );
  }
} 