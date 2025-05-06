import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({ 
    headers: await headers(),
    cookies: JSON.stringify(cookieStore.getAll()),
  });
}

