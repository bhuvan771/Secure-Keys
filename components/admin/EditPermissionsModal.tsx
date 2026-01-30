'use client';

import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';

interface EditPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: { id: string; username: string } | null;
    allProjects: { id: string; name: string }[];
}

import { useToast } from '../ui/ToastContext';

export default function EditPermissionsModal({ isOpen, onClose, onSuccess, user, allProjects }: EditPermissionsModalProps) {
    const { success, error } = useToast();
    const [permissions, setPermissions] = useState<{ [projectId: string]: string }>({}); // projectId -> 'READ' | 'WRITE'
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setLoading(true);
            // Fetch current permissions
            fetch(`/api/admin/users/${user.id}/permissions`)
                .then(res => res.json())
                .then(data => {
                    const permMap: { [key: string]: string } = {};
                    data.permissions.forEach((p: any) => {
                        permMap[p.projectId] = p.access;
                    });
                    setPermissions(permMap);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setPermissions({});
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert map to array { projectId, access }
            const payload = Object.entries(permissions).map(([projectId, access]) => ({
                projectId,
                access
            }));

            const res = await fetch(`/api/admin/users/${user.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions: payload })
            });

            if (!res.ok) throw new Error('Failed');

            success('Permissions updated successfully');
            onSuccess();
            onClose();
        } catch (err) {
            error('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    const toggleProject = (projectId: string) => {
        setPermissions(prev => {
            const next = { ...prev };
            if (next[projectId]) {
                delete next[projectId];
            } else {
                next[projectId] = 'VIEW';
            }
            return next;
        });
    };

    const changeAccess = (projectId: string, access: string) => {
        setPermissions(prev => ({
            ...prev,
            [projectId]: access
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Manage Permissions: {user.username}</h3>
                    <p className="text-sm text-gray-500">Assign project access levels</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading permissions...</div>
                    ) : (
                        <div className="space-y-2">
                            {allProjects.map(project => {
                                const hasAccess = !!permissions[project.id];
                                return (
                                    <div key={project.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${hasAccess ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <input
                                                type="checkbox"
                                                id={`proj-${project.id}`}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                                checked={hasAccess}
                                                onChange={() => toggleProject(project.id)}
                                            />
                                            <label htmlFor={`proj-${project.id}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer select-none">
                                                {project.name}
                                            </label>
                                        </div>

                                        {hasAccess && (
                                            <select
                                                className="ml-0 sm:ml-2 block w-full sm:w-auto max-w-full sm:max-w-[200px] pl-3 pr-10 py-1.5 sm:py-1 text-xs text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                value={permissions[project.id]}
                                                onChange={(e) => changeAccess(project.id, e.target.value)}
                                            >
                                                <option value="VIEW">View Only (Masked)</option>
                                                <option value="READ">Read (View Secrets)</option>
                                                <option value="EDIT">Edit (Update Secrets)</option>
                                                <option value="ADMIN">Admin (Create, Edit, Delete)</option>
                                            </select>
                                        )}
                                    </div>
                                );
                            })}
                            {allProjects.length === 0 && <p className="text-gray-500 text-center">No projects available.</p>}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                    <Button variant="secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
