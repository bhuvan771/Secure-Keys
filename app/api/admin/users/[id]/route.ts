import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { logAudit } from '@/lib/permissions';

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { role } = await request.json();
        const targetUserId = params.id;

        if (targetUserId === user.id && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Cannot revoke your own admin status' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { role }
        });

        await logAudit({
            userId: user.id,
            action: 'UPDATE_USER_ROLE',
            details: `Updated user ${updatedUser.username} role to ${role}`
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const targetUserId = params.id;

        if (targetUserId === user.id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        // First, delete projects created by this user to satisfy foreign key constraints
        await prisma.project.deleteMany({
            where: { createdById: targetUserId }
        });

        const targetUser = await prisma.user.delete({
            where: { id: targetUserId }
        });

        await logAudit({
            userId: user.id,
            action: 'DELETE_USER',
            details: `Deleted user ${targetUser.username}`
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
