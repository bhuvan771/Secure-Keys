import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { logAudit } from '@/lib/permissions';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const permissions = await prisma.permission.findMany({
            where: { userId: params.id },
            include: { project: true }
        });

        return NextResponse.json({ permissions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { permissions } = await request.json(); // Array of { projectId, access }
        const targetUserId = params.id;

        // Transaction to update permissions
        await prisma.$transaction(async (tx) => {
            // 1. Remove all existing permissions for this user (except maybe ownership, but Permission model is for access, owner is on Project.createdById)
            // Permission model is strictly helper. Owner always has access via code logic usually, or we assume implicit.
            // But let's just wipe and recreate permissions as specified.
            await tx.permission.deleteMany({
                where: { userId: targetUserId }
            });

            // 2. Create new permissions
            if (permissions && permissions.length > 0) {
                await tx.permission.createMany({
                    data: permissions.map((p: any) => ({
                        userId: targetUserId,
                        projectId: p.projectId,
                        access: p.access || 'READ'
                    }))
                });
            }
        });

        await logAudit({
            userId: user.id,
            action: 'UPDATE_PERMISSIONS',
            details: `Updated permissions for user ${targetUserId}`
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
