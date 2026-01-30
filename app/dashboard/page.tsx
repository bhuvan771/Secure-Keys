import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import Layout from '@/components/layout/Layout';
import Card, { CardBody } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get data
    const [projectCount, keyCount, recentActivity] = await Promise.all([
        // Count Projects
        prisma.project.count({
            where: user.role === 'ADMIN' ? {} : {
                permissions: {
                    some: {
                        userId: user.id,
                        access: { not: 'NONE' }
                    }
                }
            }
        }),
        // Count Keys
        prisma.key.count({
            where: user.role === 'ADMIN' ? {} : {
                project: {
                    permissions: {
                        some: {
                            userId: user.id,
                            access: { not: 'NONE' }
                        }
                    }
                }
            }
        }),
        // Get 30 Days Activity
        prisma.auditLog.findMany({
            where: {
                ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
                timestamp: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: {
                project: true,
                user: {
                    select: { username: true }
                }
            }
        })
    ]);

    return (
        <Layout userRole={user.role}>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user.username}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Projects */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Active Projects</p>
                                <h3 className="text-3xl font-bold text-blue-900">{projectCount}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Secure Keys */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 mb-1">Secure Keys</p>
                                <h3 className="text-3xl font-bold text-emerald-900">{keyCount}</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* User Role */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 mb-1">Current Role</p>
                                <h3 className="text-3xl font-bold text-purple-900 capitalize">{user.role.toLowerCase()}</h3>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Activity Log</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">Last 30 Days</span>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {recentActivity.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-8 md:col-span-6">Action</div>
                                    <div className="col-span-4 md:col-span-3 text-right md:text-left">Date</div>
                                    <div className="hidden md:block md:col-span-3 text-right">Time</div>
                                </div>

                                {recentActivity.map((log: any) => (
                                    <div key={log.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                        {/* Action Column */}
                                        <div className="col-span-8 md:col-span-6 flex items-center space-x-4">
                                            <div className={`
                                                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                                ${log.action.includes('CREATE') ? 'bg-green-100 text-green-600' :
                                                    log.action.includes('DELETE') ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'}
                                            `}>
                                                {log.action.includes('KEY') ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                ) : log.action.includes('PROJECT') ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm text-gray-900 truncate">
                                                    {(() => {
                                                        let projectName = log.project?.name;
                                                        if (!projectName && log.details) {
                                                            const match = log.details.match(/(?:project|Project)[:\s]+([\"']?)([^\"'\s]+)\1/i);
                                                            if (match) projectName = match[2];
                                                        }

                                                        let actionVerb = 'updated';
                                                        if (log.action.includes('CREATE')) actionVerb = 'created';
                                                        if (log.action.includes('DELETE')) actionVerb = 'deleted';
                                                        if (log.action === 'LOGIN') actionVerb = 'logged in';

                                                        let objectType = '';
                                                        if (log.action.includes('PROJECT')) objectType = 'project';
                                                        if (log.action.includes('KEY')) objectType = 'key';

                                                        const username = log.user?.username || 'System';
                                                        return (
                                                            <span>
                                                                <span className="font-medium text-gray-700">{username}</span> {actionVerb} {objectType}{' '}
                                                                {projectName && <span className="font-bold text-gray-900">{projectName}</span>}
                                                            </span>
                                                        );
                                                    })()}
                                                </p>
                                                {log.details && !log.details.match(/project|key/i) && (
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{log.details}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Date Column */}
                                        <div className="col-span-4 md:col-span-3 text-right md:text-left text-sm text-gray-600">
                                            {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>

                                        {/* Time Column (Hidden on mobile) */}
                                        <div className="hidden md:block md:col-span-3 text-right text-sm text-gray-400 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="text-gray-900 font-medium">No activity yet</p>
                                <p className="text-gray-500 text-sm mt-1">Actions performed in the last 30 days will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
