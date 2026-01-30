import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const logs = await prisma.auditLog.findMany({
            take: 100,
            orderBy: { timestamp: 'desc' },
            include: {
                user: { select: { username: true, email: true } },
                project: { select: { name: true } },
                key: { select: { keyName: true } }
            }
        });

        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
