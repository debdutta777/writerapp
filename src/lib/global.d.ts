declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

// Add mongoose global definition
declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
} 