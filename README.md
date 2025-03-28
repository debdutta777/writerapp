# Writer Website

A platform for creative writers to publish and manage their novels. Built with Next.js, Tailwind CSS, and MongoDB.

## Features

- **User Authentication**: Secure user signup and login
- **Novel Management**: Create, read, update, and delete novels
- **Chapter Management**: Add, edit, and organize chapters
- **Image Upload**: Upload cover images for novels and illustrations for chapters
- **View Statistics**: Track how many views each novel receives
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **File Storage**: Local storage (uploads directory)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB database

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd writer-website
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=mongodb+srv://DEBDUTTA:iZoMmLP7scgtHHX7@cluster0.iteua.mongodb.net/creator-db?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-next-auth-secret
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Project Structure

- `src/app` - Next.js App Router pages and API routes
- `src/components` - Reusable React components
- `src/lib` - Utility functions and database connection
- `src/models` - MongoDB models
- `src/types` - TypeScript type definitions
- `public/uploads` - Directory for uploaded images

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication routes

### Novels
- `GET /api/novels` - Get all novels or novels by author
- `POST /api/novels` - Create a new novel
- `GET /api/novels/:id` - Get a specific novel
- `PUT /api/novels/:id` - Update a novel
- `DELETE /api/novels/:id` - Delete a novel

### Chapters
- `GET /api/novels/:id/chapters` - Get all chapters for a novel
- `POST /api/novels/:id/chapters` - Create a new chapter
- `GET /api/novels/:id/chapters/:chapterId` - Get a specific chapter
- `PUT /api/novels/:id/chapters/:chapterId` - Update a chapter
- `DELETE /api/novels/:id/chapters/:chapterId` - Delete a chapter

## License

MIT
