import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import NovelModel from '@/models/Novel';
import { authOptions } from '../auth/[...nextauth]/route';

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

    // Parse JSON data
    const { title, description, coverImage, genres } = await req.json();

    // Validate inputs
    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      );
    }

    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return NextResponse.json(
        { message: 'At least one genre is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Create novel
    const novel = await NovelModel.create({
      title,
      description,
      coverImage,
      genres,
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
    const genre = searchParams.get('genre');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    if (authorId) {
      query.author = authorId;
    }
    if (genre) {
      query.genres = { $in: [genre] };
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
        page,
        limit,
        pages: Math.ceil(total / limit),
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