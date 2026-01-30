'use client';

import React from 'react';

interface HeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
    return (
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 px-8 py-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500 font-medium">{subtitle}</p>
                    )}
                </div>
                {action && (
                    <div>{action}</div>
                )}
            </div>
        </div>
    );
}
