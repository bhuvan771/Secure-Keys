import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_COOKIE_NAME = 'session_user_id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Create a session for a user
 * @param userId - User ID
 */
export async function createSession(userId: string) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/'
    });
}

/**
 * Get current session user ID
 * @returns User ID or null
 */
export async function getSession(): Promise<string | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    return sessionCookie?.value || null;
}

/**
 * Get current user from session
 * @returns User object or null
 */
export async function getCurrentUser() {
    const userId = await getSession();

    if (!userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true
        }
    });

    return user;
}

/**
 * Destroy current session
 */
export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Require authentication - throws if not authenticated
 * @returns User object
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

/**
 * Require admin role - throws if not admin
 * @returns User object
 */
export async function requireAdmin() {
    const user = await requireAuth();

    if (user.role !== 'ADMIN') {
        throw new Error('Forbidden - Admin access required');
    }

    return user;
}
