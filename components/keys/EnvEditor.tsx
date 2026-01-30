'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../ui/Button';

// Syntax Highlighting Imports
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism-tomorrow.css'; // Standard Dark Theme

interface EnvEditorProps {
    keys: Array<{
        keyName: string;
        keyValue: string;
        description: string | null;
        updatedAt?: string | Date;
    }>;
    projectId: string;
    onRefresh: () => void;
    readOnly?: boolean;
}

export default function EnvEditor({ keys, projectId, onRefresh, readOnly = false }: EnvEditorProps) {
    const [content, setContent] = useState('');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('saved');
    const [copied, setCopied] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Initialize content
    useEffect(() => {
        if (!initialLoad) return;
        const formatted = keys.map(key => {
            const val = key.keyValue;
            const needsQuotes = val.includes(' ') || val.includes('#') || val.includes('"') || val.includes("'");
            return `${key.keyName}=${needsQuotes ? `"${val}"` : val}`;
        }).join('\n');

        setContent(formatted);
        setInitialLoad(false);
    }, [keys, initialLoad]);

    // Auto-Save Logic
    const saveContent = useCallback(async (currentContent: string) => {
        if (readOnly) return; // Prevent save if readOnly

        setSaveStatus('saving');
        try {
            const response = await fetch(`/api/projects/${projectId}/keys/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ envContent: currentContent })
            });

            if (response.ok) {
                setSaveStatus('saved');
                onRefresh();
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            setSaveStatus('error');
        }
    }, [projectId, onRefresh, readOnly]);

    useEffect(() => {
        if (initialLoad || readOnly) return; // Skip if readOnly

        const timeoutId = setTimeout(() => {
            if (saveStatus === 'unsaved') {
                saveContent(content);
            }
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [content, saveStatus, saveContent, initialLoad, readOnly]);

    const handleChange = (code: string) => {
        if (readOnly) return; // Prevent edits in state
        setContent(code);
        setSaveStatus('unsaved');
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Line Count Calculation
    const lineCount = content.split('\n').length;
    const displayLineCount = Math.max(lineCount, 15);

    return (
        <div className="relative group flex flex-col h-[600px] bg-[#1e1e1e] rounded-lg border border-gray-800 shadow-2xl overflow-hidden font-mono text-sm">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-black/20 z-10">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <span className="ml-2 text-xs text-blue-400 flex items-center font-mono">
                        .env
                    </span>

                    {/* Status Indicator */}
                    <div className="flex items-center ml-4 space-x-2 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                        {readOnly ? (
                            <span className="text-xs text-gray-400 font-bold flex items-center">
                                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                READ ONLY
                            </span>
                        ) : (
                            <>
                                {saveStatus === 'saving' && (
                                    <div className="flex items-center text-blue-400 animate-pulse font-medium">
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        <span className="text-xs">Saving...</span>
                                    </div>
                                )}
                                {(saveStatus === 'saved' || saveStatus === 'unsaved') && (
                                    <div className={`flex items-center transition-colors duration-300 ${saveStatus === 'unsaved' ? 'text-yellow-400' : 'text-green-400'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {saveStatus === 'unsaved' ? (
                                                <circle cx="12" cy="12" r="4" fill="currentColor" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            )}
                                        </svg>
                                        <span className="text-xs ml-1.5 font-semibold tracking-wide">
                                            {saveStatus === 'unsaved' ? 'UNSAVED' : 'SAVED'}
                                        </span>
                                    </div>
                                )}
                                {saveStatus === 'error' && (
                                    <span className="text-xs text-red-500 flex items-center font-bold">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        ERROR
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleCopy}
                        className="group flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold text-white transition-all bg-[#007acc] hover:bg-[#0062a3] shadow-lg shadow-blue-500/20"
                    >
                        {copied ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                <span>COPIED</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <span>COPY FILE</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Editor Area with Line Numbers */}
            <div className="flex-1 relative flex overflow-hidden">
                {/* Line Numbers */}
                <div
                    className="bg-[#1e1e1e] border-r border-[#333] text-[#666] text-right pr-4 pl-2 pt-[20px] select-none z-10"
                    style={{ fontFamily: '"Fira Code", "Consolas", monospace', fontSize: 14, lineHeight: '21px', minWidth: '3.5rem' }}
                >
                    {Array.from({ length: displayLineCount }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>

                {/* Scrollable Editor */}
                <div className="flex-1 relative overflow-auto custom-scrollbar bg-[#1e1e1e]">
                    <Editor
                        value={content}
                        onValueChange={handleChange}
                        highlight={code => highlight(code, languages.bash || languages.plaintext, 'bash')}
                        padding={20}
                        className="font-mono min-h-full"
                        style={{
                            fontFamily: '"Fira Code", "Consolas", monospace',
                            fontSize: 14,
                            lineHeight: '21px', // Match line number line-height
                            backgroundColor: '#1e1e1e',
                            color: '#d4d4d4',
                        }}
                        textareaClassName="focus:outline-none"
                        preClassName="focus:outline-none"
                    />
                </div>

                {/* Styles (Green comments preserved) */}
                <style jsx global>{`
              .token.comment { color: #6a9955 !important; font-style: italic; }
              .token.variable { color: #9cdcfe !important; }
              .token.string { color: #ce9178 !important; }
              .token.keyword { color: #569cd6 !important; }
              .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: #1e1e1e; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #424242; border-radius: 5px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f4f4f; }
            `}</style>
            </div>

            <div className="bg-[#007acc] text-white text-[10px] px-3 py-1 flex justify-between items-center z-10">
                <span>UTF-8</span>
                <span>Bash</span>
            </div>
        </div>
    );
}
