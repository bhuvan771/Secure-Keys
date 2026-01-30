'use client';

import React, { useEffect, useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';

export default function AuditLogViewer() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/audit-logs')
            .then(res => res.json())
            .then(data => {
                setLogs(data.logs || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Activity Feed</h3>
                        <p className="text-sm text-gray-500 mt-1">Real-time system audit trails</p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {logs.length} events
                    </span>
                </div>
            </CardHeader>
            <CardBody className="p-0">
                <div className="flow-root p-6">
                    <ul role="list" className="-mb-8">
                        {logs.map((log, logIdx) => {
                            const isLast = logIdx === logs.length - 1;
                            const { icon, bg, color } = getActionStyle(log.action);

                            return (
                                <li key={log.id}>
                                    <div className="relative pb-8">
                                        {!isLast && (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        )}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${bg} ${color}`}>
                                                    {icon}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-900">
                                                        {(() => {
                                                            const { content, shouldHideDetails } = formatLogMessage(log);
                                                            return (
                                                                <>
                                                                    {content}
                                                                    {(!shouldHideDetails && log.details) && (
                                                                        <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                                            {log.details}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm whitespace-nowrap text-gray-500 font-medium">
                                                        {formatTimeAgo(new Date(log.timestamp))}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                                                        {formatExactDate(new Date(log.timestamp))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                        {logs.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No activity recorded yet.
                            </div>
                        )}
                    </ul>
                </div>
            </CardBody>
        </Card>
    );
}

// Helpers

function getActionStyle(action: string) {
    if (action.includes('DELETE')) return { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>, bg: 'bg-red-100', color: 'text-red-600' };
    if (action.includes('CREATE')) return { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, bg: 'bg-emerald-100', color: 'text-emerald-600' };
    if (action.includes('UPDATE')) return { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>, bg: 'bg-blue-100', color: 'text-blue-600' };
    if (action.includes('LOGIN')) return { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>, bg: 'bg-indigo-100', color: 'text-indigo-600' };
    if (action.includes('LOGOUT')) return { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>, bg: 'bg-gray-100', color: 'text-gray-600' };

    // Default
    return { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: 'bg-gray-100', color: 'text-gray-500' };
}

// Helper to get formatted date string
function formatExactDate(date: Date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

function formatLogMessage(log: any) {
    const userSpan = <span className="font-semibold text-gray-900">{log.user?.username || 'System'}</span>;

    // Try to get names from relations first, then from details if deleted
    let projectName = log.project?.name;
    let keyName = log.key?.keyName;

    // Fallback parsing from details string if relation is gone
    // Matches: "Deleted project XYZ", "Created project: XYZ", "project XYZ" etc.
    if (!projectName && log.details) {
        const match = log.details.match(/(?:project|Project)[:\s]+(["']?)([^"'\s]+)\1/i);
        if (match) projectName = match[2];
    }
    if (!keyName && log.details) {
        const match = log.details.match(/(?:key|Key)[:\s]+(["']?)([^"'\s]+)\1/i);
        if (match) keyName = match[2];
    }

    const projectSpan = projectName ? <span className="font-medium text-gray-800">project <span className="text-gray-900 font-bold">{projectName}</span></span> : '';
    const keySpan = keyName ? <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{keyName}</span> : '';

    const actionText = (() => {
        switch (log.action) {
            case 'LOGIN': return 'logged in';
            case 'LOGOUT': return 'logged out';
            case 'CREATE_USER': return 'created user';
            case 'DELETE_USER': return 'deleted user';
            case 'UPDATE_USER_ROLE': return 'updated role for';
            case 'UPDATE_PERMISSIONS': return 'modified permissions for';
            case 'CREATE_PROJECT': return 'created';
            case 'DELETE_PROJECT': return 'deleted';
            case 'UPDATE_KEY': return 'updated key';
            case 'CREATE_KEY': return 'created key';
            case 'DELETE_KEY': return 'deleted key';
            case 'UPDATE_KEYS_BULK': return 'synced keys in';
            default: return log.action.toLowerCase().replace(/_/g, ' ');
        }
    })();

    return {
        content: (
            <span>
                {userSpan} {actionText} {keySpan} {projectSpan ? (log.action.includes('PROJECT') ? projectSpan : <>in {projectSpan}</>) : ''}
            </span>
        ),
        // Helper to decide if we should hide details
        shouldHideDetails: !!((projectName && (log.details || '').toLowerCase().includes(projectName.toLowerCase())) ||
            (keyName && (log.details || '').toLowerCase().includes(keyName.toLowerCase())) ||
            log.action === 'LOGIN' || log.action === 'LOGOUT')
    };
}

function formatTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    // Exact date handling for the UI tooltip/subtext is handled in the component
    // This just returns the relative string
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
