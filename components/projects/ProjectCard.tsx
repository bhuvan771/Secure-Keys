'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardBody } from '../ui/Card';

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        description: string | null;
        _count?: {
            keys: number;
        };
    };
    onDelete?: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
    const router = useRouter();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(project.id);
    };

    return (
        <Card hover onClick={() => router.push(`/projects/${project.id}`)}>
            <CardBody className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        </div>

                        {project.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {project.description}
                            </p>
                        )}

                        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span>{project._count?.keys || 0} keys</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                title="Delete Project"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
