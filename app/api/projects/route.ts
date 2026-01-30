import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { logAudit } from '@/lib/permissions';

export async function GET() {
    try {
        const user = await requireAuth();

        let projects;
        if (user.role === 'ADMIN') {
            projects = await prisma.project.findMany({
                include: {
                    _count: { select: { keys: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            projects = await prisma.project.findMany({
                where: {
                    permissions: {
                        some: {
                            userId: user.id,
                            access: { not: 'NONE' }
                        }
                    }
                },
                include: {
                    _count: { select: { keys: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only admins can create projects' }, { status: 403 });
        }

        const { name, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                createdById: user.id
            },
            include: {
                _count: { select: { keys: true } }
            }
        });

        await logAudit({
            userId: user.id,
            projectId: project.id,
            action: 'CREATE_PROJECT',
            details: `Created project: ${name}`
        });

        return NextResponse.json({ project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
