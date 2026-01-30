import { NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/session';
import { logAudit } from '@/lib/permissions';

export async function POST() {
    try {
        const userId = await getSession();

        if (userId) {
            // Log audit before destroying session
            await logAudit({
                userId,
                action: 'LOGOUT',
                details: 'User logged out'
            });
        }

        await destroySession();

        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    }
}
