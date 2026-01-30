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

        const response = NextResponse.json({ success: true });

        // Clear session cookie explicitly if needed, but destroySession handles it
        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
