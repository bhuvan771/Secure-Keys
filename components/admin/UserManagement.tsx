'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Card, { CardBody, CardHeader } from '../ui/Card';
import CreateUserModal from './CreateUserModal';
import EditPermissionsModal from './EditPermissionsModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useRouter } from 'next/navigation';

interface UserManagementProps {
    initialUsers: any[];
    allProjects: any[];
}

import { useToast } from '../ui/ToastContext';

export default function UserManagement({ initialUsers, allProjects }: UserManagementProps) {
    const router = useRouter(); // Using router.refresh() for ease or internal state management
    const { success, error } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [permissionsUser, setPermissionsUser] = useState<any>(null);
    const [roleUpdates, setRoleUpdates] = useState<{ [key: string]: string }>({});

    // Delete state
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletedUserIds, setDeletedUserIds] = useState<Set<string>>(new Set());

    // Filter users based on search
    const users = initialUsers
        .filter(u => !deletedUserIds.has(u.id))
        .map(u => ({ ...u, role: roleUpdates[u.id] || u.role }))
        .filter(u =>
            (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

    const refreshUsers = async () => {
        window.location.reload();
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        // Optimistic update
        setRoleUpdates(prev => ({ ...prev, [userId]: newRole }));

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error('Failed to update role');
            success(`User role updated to ${newRole}`);
        } catch (err) {
            error('Failed to update role');
            // Revert
            const newUpdates = { ...roleUpdates };
            delete newUpdates[userId];
            setRoleUpdates(newUpdates);
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                // Optimistic delete without reload
                setDeletedUserIds(prev => {
                    const next = new Set(prev);
                    next.add(userToDelete.id);
                    return next;
                });
                setUserToDelete(null);
                success('User deleted successfully');
            } else {
                const data = await res.json();
                error(data.error || 'Failed to delete user');
            }
        } catch (err) {
            error('An error occurred');
        }
    };

    return (
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-gray-50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Team Members</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Manage access and roles</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Find user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 transition-all outline-none"
                        />
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Member
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="p-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Access</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {users.map((u) => {
                                    const lastLogin = u.auditLogs?.[0]?.timestamp;
                                    const initials = u.username.slice(0, 2).toUpperCase();
                                    // Simple deterministic color based on username length
                                    const colors = ['bg-indigo-100 text-indigo-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700'];
                                    const colorClass = colors[u.username.length % colors.length];

                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-10 w-10 text-sm font-bold rounded-full flex items-center justify-center ${colorClass}`}>
                                                        {initials}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                                        <div className="text-sm text-gray-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="relative inline-block text-left">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                        className={`
                                                    block w-full pl-3 pr-8 py-1.5 text-xs text-center font-semibold rounded-full border-0 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 cursor-pointer appearance-none
                                                    ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}
                                                `}
                                                        style={{ textAlignLast: 'center' }}
                                                    >
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {lastLogin ? (
                                                    <span className="inline-flex items-center">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                                                        {formatTimeAgo(new Date(lastLogin))}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-gray-400">
                                                        <span className="h-2 w-2 rounded-full bg-gray-300 mr-2"></span>
                                                        Never
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

                                                {u.role === 'ADMIN' ? (
                                                    <span className="text-gray-400 italic text-xs">Has full access</span>
                                                ) : (
                                                    <div className="flex flex-col space-y-1">
                                                        {u.permissions && u.permissions.length > 0 ? (
                                                            <>
                                                                {u.permissions.slice(0, 2).map((p: any) => (
                                                                    <div key={p.id} className="text-xs flex items-center justify-between gap-2">
                                                                        <span className="font-medium truncate max-w-[100px]" title={p.project.name}>{p.project.name}</span>
                                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide
                                                                        ${p.access === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                                                p.access === 'EDIT' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                                                    p.access === 'READ' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                                                        'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                                            {p.access}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                {u.permissions.length > 2 && (
                                                                    <span className="text-xs text-gray-400 italic">+{u.permissions.length - 2} more...</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs italic">No projects assigned</span>
                                                        )}
                                                        <button
                                                            onClick={() => setPermissionsUser(u)}
                                                            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold hover:underline mt-1 text-left"
                                                        >
                                                            Manage Access
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => setUserToDelete(u)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                                    title="Delete User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div >
            </CardBody >

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={refreshUsers}
                allProjects={allProjects}
            />

            <EditPermissionsModal
                isOpen={!!permissionsUser}
                onClose={() => setPermissionsUser(null)}
                onSuccess={refreshUsers}
                user={permissionsUser}
                allProjects={allProjects}
            />

            <ConfirmationModal
                isOpen={!!userToDelete}
                title="Delete User"
                message={`Are you sure you want to delete user ${userToDelete?.username}? They will lose access to all projects.`}
                onConfirm={confirmDelete}
                onClose={() => setUserToDelete(null)}
                isDangerous={true}
            />
        </Card >
    );
}

function formatTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";

    return "just now";
}
