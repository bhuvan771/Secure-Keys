import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import Layout from '@/components/layout/Layout';

import AdminDashboard from '@/components/admin/AdminDashboard'; // Import Dashboard

export const dynamic = 'force-dynamic'; // Ensure live data

export default async function AdminPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // Get all users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
                select: { permissions: true }
            },
            permissions: {
                include: {
                    project: { select: { name: true } }
                }
            },
            auditLogs: {
                where: { action: 'LOGIN' },
                orderBy: { timestamp: 'desc' },
                take: 1,
                select: { timestamp: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Get all projects (for permission assignment)
    const projects = await prisma.project.findMany({
        select: {
            id: true,
            name: true,
            _count: {
                select: { keys: true, permissions: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <Layout userRole={user.role}>
            <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
                    <p className="text-gray-600">Manage users, roles, and system activity</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <AdminDashboard initialUsers={users} projects={projects} />
                </div>
            </div>
        </Layout>
    );
}
