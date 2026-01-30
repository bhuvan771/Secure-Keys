'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EnvEditor from '@/components/keys/EnvEditor';
import ExcelViewer from '@/components/keys/ExcelViewer';
import CreateKey from '@/components/keys/CreateKey';
import Button from '@/components/ui/Button';

interface ProjectDetailClientProps {
    project: any;
    keys: any[];
    userRole: string;
    accessLevel: string; // VIEW, READ, EDIT, ADMIN
}

export default function ProjectDetailClient({ project, keys: initialKeys, userRole, accessLevel }: ProjectDetailClientProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [keys, setKeys] = useState(initialKeys);
    // Default to 'env' mode as requested
    const [viewMode, setViewMode] = useState<'env' | 'excel'>('env');

    // Permissions
    const canCreate = userRole === 'ADMIN' || accessLevel === 'ADMIN';
    const canEdit = userRole === 'ADMIN' || ['EDIT', 'ADMIN'].includes(accessLevel);

    const refreshKeys = async () => {
        const response = await fetch(`/api/projects/${project.id}/keys`);
        const data = await response.json();
        setKeys(data.keys);
    };

    return (
        <div>
            <div className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/projects')}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                    ${accessLevel === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                        accessLevel === 'EDIT' ? 'bg-orange-100 text-orange-700' :
                                            accessLevel === 'READ' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-600'}`}>
                                    {accessLevel === 'ADMIN' ? 'Full Access' : accessLevel}
                                </span>
                            </div>
                            {project.description && (
                                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                        {/* New View Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('env')}
                                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'env'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                <span>Code</span>
                            </button>
                            <button
                                onClick={() => setViewMode('excel')}
                                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'excel'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7-4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                <span>Table</span>
                            </button>
                        </div>

                        {canCreate && (
                            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center shadow-lg shadow-indigo-500/20">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Key
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto">
                {viewMode === 'env' ? (
                    <EnvEditor
                        keys={keys}
                        projectId={project.id}
                        onRefresh={refreshKeys}
                        readOnly={!canEdit}
                    />
                ) : (
                    keys.length > 0 ? (
                        <ExcelViewer keys={keys} />
                    ) : (
                        // Empty state
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No keys found</h3>
                            {canCreate && <p className="mt-1 text-gray-500">Switch to Code view to add your first key.</p>}
                        </div>
                    )
                )}
            </div>

            {canCreate && (
                <CreateKey
                    isOpen={isCreateOpen}
                    projectId={project.id}
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={refreshKeys}
                />
            )}
        </div>
    );
}
