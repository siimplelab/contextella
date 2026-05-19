import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, passwordHash } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
