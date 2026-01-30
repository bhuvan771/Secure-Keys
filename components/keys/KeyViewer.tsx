'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface KeyViewerProps {
    keyData: {
        id: string;
        keyName: string;
        keyValue: string;
        keyType: string;
        description: string | null;
    };
}

export default function KeyViewer({ keyData }: KeyViewerProps) {
    const [showValue, setShowValue] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(keyData.keyValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getLanguage = (type: string) => {
        switch (type) {
            case 'ENV': return 'bash';
            case 'API': return 'text';
            case 'SSH': return 'text';
            case 'DATABASE': return 'text';
            default: return 'text';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{keyData.keyName}</h3>
                        {keyData.description && (
                            <p className="text-sm text-gray-600 mt-1">{keyData.description}</p>
                        )}
                    </div>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {keyData.keyType}
                    </span>
                </div>
            </CardHeader>

            <CardBody>
                {!showValue ? (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">Click to reveal key value</p>
                        <Button
                            variant="primary"
                            size="sm"
                            className="mt-4"
                            onClick={() => setShowValue(true)}
                        >
                            Show Value
                        </Button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-end mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="rounded-lg overflow-hidden">
                            <SyntaxHighlighter
                                language={getLanguage(keyData.keyType)}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {keyData.keyValue}
                            </SyntaxHighlighter>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowValue(false)}
                            >
                                Hide Value
                            </Button>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
