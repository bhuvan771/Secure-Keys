'use client';

import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    userRole?: 'ADMIN' | 'USER';
}

export default function Layout({ children, userRole }: LayoutProps) {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <Sidebar userRole={userRole} />
            <main className="flex-1 overflow-auto">
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
