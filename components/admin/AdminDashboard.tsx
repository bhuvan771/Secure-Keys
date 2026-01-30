'use client';

import React, { useState } from 'react';
import UserManagement from './UserManagement';
import AuditLogViewer from './AuditLogViewer';

interface AdminDashboardProps {
    initialUsers: any[];
    projects: any[]; // Project list for permissions
}

export default function AdminDashboard({ initialUsers, projects }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

    // Calculate quick stats
    const totalUsers = initialUsers.length;
    const totalProjects = projects.length;
    const totalKeys = projects.reduce((acc, p) => acc + (p._count?.keys || 0), 0);

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Projects</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalProjects}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 21c-.556 0-1.077-.27-1.414-.707l-2.12-2.88a1 1 0 00-1.587 0l-1.06 1.415a1 1 0 01-1.587 0l-1.415-1.415c-.41-.41-.482-1.053-.178-1.543l3.65-5.918A6.002 6.002 0 014 9a6 6 0 016-6z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Keys Managed</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalKeys}</h3>
                    </div>
                </div>
            </div>

            {/* Modern Tabs */}
            <div className="flex justify-center">
                <div className="bg-gray-100/80 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`
                            px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === 'users'
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                        `}
                    >
                        Users & Permissions
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`
                            px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === 'logs'
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                        `}
                    >
                        Audit Timeline
                    </button>
                </div>
            </div>

            {/* Content Area - minimal fade in could be added here if we had framer-motion, but simple conditional is fine */}
            <div className="min-h-[500px]">
                {activeTab === 'users' ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Users Table */}
                        <UserManagement initialUsers={initialUsers} allProjects={projects} />

                        {/* Project Summary Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Project Health</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projects.map(p => (
                                    <div key={p.id} className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all cursor-default">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-gray-50 group-hover:bg-indigo-50 rounded-lg transition-colors">
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                            </div>
                                            {p._count.keys === 0 && <span className="h-2 w-2 rounded-full bg-orange-400" title="Empty project" />}
                                            {p._count.keys > 0 && <span className="h-2 w-2 rounded-full bg-emerald-400" title="Active" />}
                                        </div>
                                        <h4 className="font-semibold text-gray-900 truncate">{p.name}</h4>
                                        <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{p._count.keys} keys</span>
                                            <span>{p._count.permissions} users</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        <AuditLogViewer />
                    </div>
                )}
            </div>
        </div>
    );
}
