import { auth } from '@/auth';

// Resolves the signed-in user's id, or null when there is no valid session.
export async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
