import mongoose from 'mongoose';

// Define the type for the cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Define the global type
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined!');
  throw new Error('Please define the MONGODB_URI environment variable');
}

console.log('MongoDB connection string is configured');

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Give up initial connection after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  } else {
    console.log('Using pending MongoDB connection');
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to establish MongoDB connection:', error);
    throw error;
  }
}

export default connectDB; 