import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { logAudit } from '@/lib/permissions';

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only admins can delete projects' }, { status: 403 });
        }

        const projectId = params.id;

        // Fetch project name for the log
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Transaction to delete keys, logs, and project
        await prisma.$transaction([
            // 1. Delete all keys associated with project
            prisma.key.deleteMany({
                where: { projectId }
            }),

            // 2. Delete Project
            prisma.project.delete({
                where: { id: projectId }
            })
        ]);

        await logAudit({
            userId: user.id,
            action: 'DELETE_PROJECT',
            details: `Deleted project ${project.name}`,
            ipAddress: request.headers.get('x-forwarded-for') || undefined
            // Intentionally not setting projectId as it is deleted
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
