'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Button from '../ui/Button';

interface EnvViewerProps {
    keys: Array<{
        keyName: string;
        keyValue: string;
        description: string | null;
    }>;
}

export default function EnvViewer({ keys }: EnvViewerProps) {
    const [copied, setCopied] = useState(false);

    // Format keys strictly as NAME=VALUE
    // No comments, no extra lines, just raw .env format
    const envContent = keys.map(key => {
        // Escape value if it contains spaces or special chars
        const value = key.keyValue && (key.keyValue.includes(' ') || key.keyValue.includes('#'))
            ? `"${key.keyValue}"`
            : key.keyValue;

        return `${key.keyName}=${value}`;
    }).join('\n');

    const handleCopy = async () => {
        await navigator.clipboard.writeText(envContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center text-xs bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                >
                    {copied ? (
                        <>
                            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </>
                    )}
                </Button>
            </div>

            <div className="rounded-lg overflow-hidden border border-gray-800 shadow-2xl bg-[#1e1e1e]">
                {/* VS Code like header */}
                <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-gray-800/50">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-400 font-medium font-mono">.env</span>
                    </div>
                </div>

                {/* Editor Area */}
                <SyntaxHighlighter
                    language="bash"
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                        backgroundColor: '#1e1e1e', // Dark VS Code background
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{
                        minWidth: '3em',
                        paddingRight: '1em',
                        color: '#858585',
                        textAlign: 'right'
                    }}
                >
                    {envContent || '# No keys added yet'}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
