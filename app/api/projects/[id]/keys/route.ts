import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { hasProjectAccess, getProjectPermission } from '@/lib/permissions';
import { encrypt, decrypt } from '@/lib/encryption';
import { logAudit } from '@/lib/permissions';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        const accessLvl = await getProjectPermission(user.id, params.id);
        const hasAccess = user.role === 'ADMIN' || (accessLvl && accessLvl !== 'NONE');

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const keys = await prisma.key.findMany({
            where: { projectId: params.id },
            orderBy: { createdAt: 'desc' }
        });

        // Determine if user can read secrets (READ, EDIT, WRITE, ADMIN)
        const canReadSecrets = user.role === 'ADMIN' || ['READ', 'EDIT', 'WRITE', 'ADMIN'].includes(accessLvl || '');

        // Decrypt keys before sending, or mask if view only
        const decryptedKeys = keys.map((key: { keyValue: string;[key: string]: any }) => ({
            ...key,
            keyValue: canReadSecrets ? decrypt(key.keyValue) : '************************'
        }));

        return NextResponse.json({ keys: decryptedKeys, accessLevel: user.role === 'ADMIN' ? 'ADMIN' : accessLvl });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        const accessLvl = await getProjectPermission(user.id, params.id);

        // Full Control (ADMIN) or Global Admin required to add keys
        const canCreate = user.role === 'ADMIN' || accessLvl === 'ADMIN';

        if (!canCreate) {
            return NextResponse.json({ error: 'Only admins project owners can add keys' }, { status: 403 });
        }

        const { keyName, keyValue, keyType, description } = await request.json();

        if (!keyName || !keyValue) {
            return NextResponse.json({ error: 'Key name and value are required' }, { status: 400 });
        }

        // Encrypt the key value
        const encryptedValue = encrypt(keyValue);

        const key = await prisma.key.create({
            data: {
                projectId: params.id,
                keyName,
                keyValue: encryptedValue,
                keyType: keyType || 'OTHER',
                description
            }
        });

        await logAudit({
            userId: user.id,
            projectId: params.id,
            keyId: key.id,
            action: 'CREATE_KEY',
            details: `Created key: ${keyName}`
        });

        return NextResponse.json({ key });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
