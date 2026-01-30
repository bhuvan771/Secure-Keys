import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { getProjectPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/permissions';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string; keyId: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        const accessLvl = await getProjectPermission(user.id, params.id);
        const hasAccess = user.role === 'ADMIN' || (accessLvl && accessLvl !== 'NONE');

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const key = await prisma.key.findUnique({
            where: { id: params.keyId, projectId: params.id }
        });

        if (!key) {
            return NextResponse.json({ error: 'Key not found' }, { status: 404 });
        }

        const canReadSecrets = user.role === 'ADMIN' || ['READ', 'EDIT', 'WRITE', 'ADMIN'].includes(accessLvl || '');

        const decryptedKey = {
            ...key,
            keyValue: canReadSecrets ? decrypt(key.keyValue) : '************************'
        };

        return NextResponse.json({ key: decryptedKey });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string; keyId: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        const accessLvl = await getProjectPermission(user.id, params.id);

        // Check for EDIT or ADMIN permission
        const canEdit = user.role === 'ADMIN' || ['EDIT', 'WRITE', 'ADMIN'].includes(accessLvl || '');

        if (!canEdit) {
            return NextResponse.json({ error: 'Insufficient permissions to edit keys' }, { status: 403 });
        }

        const { keyName, keyValue, description } = await request.json();

        // Prepare update data
        const updateData: any = {};
        if (keyName) updateData.keyName = keyName;
        if (description !== undefined) updateData.description = description;
        if (keyValue) updateData.keyValue = encrypt(keyValue);

        const key = await prisma.key.update({
            where: { id: params.keyId, projectId: params.id },
            data: updateData
        });

        await logAudit({
            userId: user.id,
            projectId: params.id,
            keyId: key.id,
            action: 'UPDATE_KEY',
            details: `Updated key: ${key.keyName}`
        });

        return NextResponse.json({ key });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string; keyId: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        const accessLvl = await getProjectPermission(user.id, params.id);

        // Check for ADMIN permission (Project Owner/Admin)
        const canDelete = user.role === 'ADMIN' || accessLvl === 'ADMIN';

        if (!canDelete) {
            return NextResponse.json({ error: 'Only admins can delete keys' }, { status: 403 });
        }

        const key = await prisma.key.delete({
            where: { id: params.keyId, projectId: params.id }
        });

        await logAudit({
            userId: user.id,
            projectId: params.id,
            keyId: params.keyId,
            action: 'DELETE_KEY',
            details: `Deleted key: ${key.keyName}`
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
