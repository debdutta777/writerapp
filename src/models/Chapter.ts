import mongoose from 'mongoose';
import { Chapter } from '@/types';

const chapterSchema = new mongoose.Schema<Chapter>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    novelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Novel',
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chapter || mongoose.model<Chapter>('Chapter', chapterSchema); 