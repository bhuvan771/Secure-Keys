'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    allProjects: { id: string; name: string }[];
}

export default function CreateUserModal({ isOpen, onClose, onSuccess, allProjects }: CreateUserModalProps) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });
    const [permissions, setPermissions] = useState<{ [projectId: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

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
        setPermissions(prev => ({ ...prev, [projectId]: access }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                permissions: Object.entries(permissions).map(([projectId, access]) => ({
                    projectId,
                    access
                }))
            };

            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create user');

            onSuccess();
            onClose();
            // Reset form
            setFormData({ username: '', email: '', password: '', role: 'USER' });
            setPermissions({});
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                        <p className="text-sm text-gray-500">Add a new team member and assign access</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="create-user-form" onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Role</label>
                                <select
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="USER">User (Restricted Access)</option>
                                    <option value="ADMIN">Admin (Full Access)</option>
                                </select>
                            </div>
                        </div>

                        {formData.role !== 'ADMIN' && (
                            <div className="border-t border-gray-100 pt-6">
                                <label className="block text-sm font-bold text-gray-900 mb-3">Project Access Permissions</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {allProjects.map(project => {
                                        const hasAccess = !!permissions[project.id];
                                        return (
                                            <div key={project.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors ${hasAccess ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                <div className="flex items-center mb-2 sm:mb-0">
                                                    <input
                                                        type="checkbox"
                                                        id={`new-proj-${project.id}`}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                                        checked={hasAccess}
                                                        onChange={() => toggleProject(project.id)}
                                                    />
                                                    <label htmlFor={`new-proj-${project.id}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer select-none">
                                                        {project.name}
                                                    </label>
                                                </div>

                                                {hasAccess && (
                                                    <select
                                                        className="ml-0 sm:ml-2 block w-full sm:w-auto max-w-full sm:max-w-[200px] pl-2 pr-8 py-1.5 sm:py-1 text-xs text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                                                        value={permissions[project.id]}
                                                        onChange={(e) => changeAccess(project.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
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
                                    {allProjects.length === 0 && <p className="text-gray-500 text-sm italic">No active projects available.</p>}
                                </div>
                            </div>
                        )}
                        {formData.role === 'ADMIN' && (
                            <div className="bg-purple-50 p-4 rounded-lg text-sm text-purple-700">
                                <span className="font-semibold">Note:</span> Administrators have full access to all projects and keys automatically.
                            </div>
                        )}
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" form="create-user-form" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create User'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
