import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getUserProjects } from '@/lib/permissions';
import Layout from '@/components/layout/Layout';
import ProjectList from '@/components/projects/ProjectList';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // Get projects based on user role
    let projects;
    if (user.role === 'ADMIN') {
        projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { keys: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } else {
        const projectIds = await getUserProjects(user.id);
        projects = await prisma.project.findMany({
            where: {
                id: { in: projectIds }
            },
            include: {
                _count: {
                    select: { keys: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    return (
        <Layout userRole={user.role}>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <ProjectList initialProjects={projects} userRole={user.role} />
            </div>
        </Layout>
    );
}
