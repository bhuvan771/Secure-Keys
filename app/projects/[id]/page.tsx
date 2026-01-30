import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getProjectPermission } from '@/lib/permissions';
import { decrypt } from '@/lib/encryption';
import Layout from '@/components/layout/Layout';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // Check access
    const accessLvl = await getProjectPermission(user.id, params.id);
    const hasAccess = user.role === 'ADMIN' || (accessLvl && accessLvl !== 'NONE');

    if (!hasAccess) {
        redirect('/projects');
    }

    // Get project
    const project = await prisma.project.findUnique({
        where: { id: params.id }
    });

    if (!project) {
        redirect('/projects');
    }

    // Get keys
    const keys = await prisma.key.findMany({
        where: { projectId: params.id },
        orderBy: { createdAt: 'desc' }
    });

    // Check if can read secrets
    const canReadSecrets = user.role === 'ADMIN' || ['READ', 'EDIT', 'WRITE', 'ADMIN'].includes(accessLvl || '');

    // Decrypt keys or mask
    const decryptedKeys = keys.map((key: { keyValue: string;[key: string]: any }) => ({
        ...key,
        keyValue: canReadSecrets ? decrypt(key.keyValue) : '************************'
    }));

    // Resolve effective access level for Client
    const effectiveAccess = user.role === 'ADMIN' ? 'ADMIN' : accessLvl || 'VIEW';

    return (
        <Layout userRole={user.role}>
            <ProjectDetailClient
                project={project}
                keys={decryptedKeys}
                userRole={user.role}
                accessLevel={effectiveAccess}
            />
        </Layout>
    );
}
