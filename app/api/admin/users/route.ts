import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { hash } from 'bcryptjs';
import { logAudit } from '@/lib/permissions';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { username, email, password, role, permissions } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: role || 'USER',
                permissions: {
                    create: Array.isArray(permissions) ? permissions.map((p: any) => ({
                        projectId: p.projectId,
                        access: p.access || 'READ'
                    })) : []
                }
            }
        });

        await logAudit({
            userId: user.id,
            action: 'CREATE_USER',
            details: `Created user ${newUser.username} (${newUser.email}) with role ${newUser.role}`
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ user: userWithoutPassword });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
