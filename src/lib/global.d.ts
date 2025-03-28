import type _mongoose from 'mongoose';

declare global {
  let mongoose: {
    conn: any;
    promise: Promise<typeof import('mongoose')> | null;
  };
} 