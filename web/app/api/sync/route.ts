import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/api/session';
import { parseBirthInput } from '@/lib/saju/index';

// Cloud snapshot endpoint. The app is fully local-first; this route only
// backs up / restores a signed-in user's data. Guests never call it.

export async function GET() {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { universes: { include: { members: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'asc' } } },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const profile = user.birthDate
    ? { name: user.name, birthDate: user.birthDate, birthTime: user.birthTime, gender: user.gender ?? 'o' }
    : null;

  const universes = user.universes.map(u => ({
    id: u.id,
    nameKo: u.nameKo,
    nameEn: u.nameEn,
    icon: u.icon,
    accentTint: u.accentTint,
    members: u.members.map(m => ({
      id: m.id,
      nameKo: m.nameKo,
      nameEn: m.nameEn,
      relation: m.relation,
      gender: m.gender,
      birthDate: m.birthDate,
      birthTime: m.birthTime,
      emoji: m.emoji,
    })),
  }));

  return NextResponse.json({ email: user.email, profile, universes });
}

export async function PUT(req: Request) {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { profile?: unknown; universes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const p = body.profile as Record<string, unknown> | null | undefined;
  if (!p || typeof p.birthDate !== 'string') {
    return NextResponse.json({ error: 'A profile with a birth date is required' }, { status: 400 });
  }
  const birthTime = typeof p.birthTime === 'string' && p.birthTime ? p.birthTime : null;
  if (!parseBirthInput(p.birthDate, birthTime)) {
    return NextResponse.json({ error: 'Invalid birth date or time' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: uid },
    data: {
      name: typeof p.name === 'string' && p.name.trim() ? p.name.trim() : undefined,
      birthDate: p.birthDate,
      birthTime,
      birthTimeKnown: birthTime !== null,
      gender: typeof p.gender === 'string' ? p.gender : 'o',
    },
  });

  // Replace the user's universes wholesale with the client snapshot.
  await prisma.universe.deleteMany({ where: { userId: uid } });

  const universes = Array.isArray(body.universes) ? body.universes : [];
  for (const raw of universes) {
    const u = raw as Record<string, unknown>;
    if (typeof u.id !== 'string') continue;
    const members = Array.isArray(u.members) ? u.members : [];
    await prisma.universe.create({
      data: {
        id: u.id,
        userId: uid,
        nameKo: typeof u.nameKo === 'string' ? u.nameKo : 'Universe',
        nameEn: typeof u.nameEn === 'string' ? u.nameEn : 'Universe',
        icon: typeof u.icon === 'string' ? u.icon : null,
        accentTint: typeof u.accentTint === 'string' ? u.accentTint : null,
        members: {
          create: members
            .map(m => m as Record<string, unknown>)
            .filter(m => typeof m.id === 'string' && typeof m.birthDate === 'string')
            .map(m => {
              const mTime = typeof m.birthTime === 'string' && m.birthTime ? m.birthTime : null;
              return {
                id: m.id as string,
                nameKo: typeof m.nameKo === 'string' ? m.nameKo : 'Friend',
                nameEn: typeof m.nameEn === 'string' ? m.nameEn : 'Friend',
                relation: typeof m.relation === 'string' ? m.relation : 'other',
                gender: typeof m.gender === 'string' ? m.gender : 'o',
                birthDate: m.birthDate as string,
                birthTime: mTime,
                birthTimeKnown: mTime !== null,
                emoji: typeof m.emoji === 'string' ? m.emoji : null,
              };
            }),
        },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
