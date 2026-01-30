import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { getProjectPermission } from '@/lib/permissions';
import { encrypt, decrypt } from '@/lib/encryption';
import { logAudit } from '@/lib/permissions';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await requireAuth();
        const accessLvl = await getProjectPermission(user.id, params.id);

        // Basic access check
        const hasAccess = user.role === 'ADMIN' || (accessLvl && ['EDIT', 'WRITE', 'ADMIN'].includes(accessLvl));

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied. You need at least EDIT permissions.' }, { status: 403 });
        }

        const { envContent } = await request.json();

        // 1. Parse the .env content
        const lines = envContent.split('\n');
        const parsedKeys: Record<string, string> = {};

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const equalsIndex = trimmed.indexOf('=');
            if (equalsIndex === -1) continue;

            const key = trimmed.slice(0, equalsIndex).trim();
            let value = trimmed.slice(equalsIndex + 1).trim();

            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            if (key) parsedKeys[key] = value;
        }

        // 2. Get existing keys
        const existingKeys = await prisma.key.findMany({
            where: { projectId: params.id }
        });

        const existingKeyMap = new Map<string, typeof existingKeys[0]>(existingKeys.map(k => [k.keyName, k]));
        const newKeyNames = new Set(Object.keys(parsedKeys));
        const existingKeyNames = new Set(existingKeys.map(k => k.keyName));

        // 3. Identify Operations
        const keysToCreate = Object.keys(parsedKeys).filter(k => !existingKeyNames.has(k));
        const keysToDelete = existingKeys.filter(k => !newKeyNames.has(k.keyName));
        const keysToUpdate = Object.keys(parsedKeys).filter(k => {
            const existing = existingKeyMap.get(k);
            if (!existing) return false;
            const currentDecrypted = decrypt(existing.keyValue);
            return currentDecrypted !== parsedKeys[k];
        });

        // 4. Check Permissions
        const isAdmin = user.role === 'ADMIN' || accessLvl === 'ADMIN';

        if (keysToCreate.length > 0 && !isAdmin) {
            return NextResponse.json({ error: 'You do not have permission to CREATE new keys. (Admin required)' }, { status: 403 });
        }

        if (keysToDelete.length > 0 && !isAdmin) {
            return NextResponse.json({ error: 'You do not have permission to DELETE keys. (Admin required)' }, { status: 403 });
        }

        // Update is allowed for EDIT, WRITE, ADMIN
        // We already checked basic access is at least EDIT at the start.

        // 5. Perform Updates
        await prisma.$transaction(async (tx) => {
            // Creates
            for (const keyName of keysToCreate) {
                const encryptedValue = encrypt(parsedKeys[keyName]);
                const newKey = await tx.key.create({
                    data: {
                        projectId: params.id,
                        keyName,
                        keyValue: encryptedValue,
                        keyType: 'ENV',
                    }
                });
                // Log Creation
                await tx.auditLog.create({
                    data: {
                        userId: user.id,
                        projectId: params.id,
                        keyId: newKey.id,
                        action: 'CREATE_KEY',
                        details: `Created by ${user.username}`
                    }
                });
            }

            // Deletes
            for (const k of keysToDelete) {
                await tx.key.delete({ where: { id: k.id } });
                await tx.auditLog.create({
                    data: {
                        userId: user.id,
                        projectId: params.id,
                        action: 'DELETE_KEY',
                        details: `Deleted key ${k.keyName} by ${user.username}`
                    }
                });
            }

            // Updates
            for (const keyName of keysToUpdate) {
                const existing = existingKeyMap.get(keyName)!;
                const encryptedValue = encrypt(parsedKeys[keyName]);

                await tx.key.update({
                    where: { id: existing.id },
                    data: { keyValue: encryptedValue, description: null }
                });

                await tx.auditLog.create({
                    data: {
                        userId: user.id,
                        projectId: params.id,
                        keyId: existing.id,
                        action: 'UPDATE_KEY',
                        details: `Value updated by ${user.username}`
                    }
                });
            }
        });

        return NextResponse.json({ success: true, changes: { created: keysToCreate.length, deleted: keysToDelete.length, updated: keysToUpdate.length } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
