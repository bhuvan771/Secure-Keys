'use client';

import React, { useState } from 'react';

interface ExcelViewerProps {
    keys: any[];
}

export default function ExcelViewer({ keys }: ExcelViewerProps) {
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

    const toggleVisibility = (id: string) => {
        setVisibleKeys(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                Key Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                                Value
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {keys.map((key) => (
                            <tr key={key.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                    {key.keyName}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    <div className="flex items-center space-x-2">
                                        <span className={`truncate max-w-md ${visibleKeys[key.id] ? '' : 'blur-sm select-none'}`}>
                                            {visibleKeys[key.id] ? key.keyValue : '••••••••••••••••••••••••'}
                                        </span>
                                        <button
                                            onClick={() => toggleVisibility(key.id)}
                                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {visibleKeys[key.id] ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(key.keyValue)}
                                            className="text-gray-400 hover:text-blue-600 focus:outline-none"
                                            title="Copy value"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {key.keyType}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
