import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Root redirect handled by next.config.ts
  // Add other middleware logic here as needed
  return NextResponse.next();
}
