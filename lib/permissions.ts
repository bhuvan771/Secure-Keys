import { prisma } from './prisma';

/**
 * Check if a user has access to a specific project
 * @param userId - User ID
 * @param projectId - Project ID
 * @returns True if user has access (READ or WRITE)
 */
export async function hasProjectAccess(userId: string, projectId: string): Promise<boolean> {
    const permission = await prisma.permission.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    });

    return permission !== null && permission.access !== 'NONE';
}

/**
 * Check if user is admin
 * @param userId - User ID
 * @returns True if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    return user?.role === 'ADMIN';
}

/**
 * Get all projects a user has access to
 * @param userId - User ID
 * @returns Array of project IDs
 */
export async function getUserProjects(userId: string): Promise<string[]> {
    const permissions = await prisma.permission.findMany({
        where: {
            userId,
            access: {
                not: 'NONE'
            }
        },
        select: {
            projectId: true
        }
    });

    return permissions.map(p => p.projectId);
}

/**
 * Log an audit event
 * @param params - Audit log parameters
 */
export async function logAudit(params: {
    userId: string;
    action: string;
    projectId?: string;
    keyId?: string;
    details?: string;
    ipAddress?: string;
}) {
    await prisma.auditLog.create({
        data: params
    });
}

/**
 * Get the specific access level for a user on a project
 * @param userId - User ID
 * @param projectId - Project ID
 * @returns AccessLevel string or null
 */
export async function getProjectPermission(userId: string, projectId: string): Promise<string | null> {
    const permission = await prisma.permission.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    });

    return permission ? permission.access : null;
}
