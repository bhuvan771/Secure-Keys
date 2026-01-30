'use client';

import React from 'react';
// Actually, I'll build a raw React modal to ensure it works without extra deps.

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden backdrop-blur-sm bg-black/30">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all scale-100 p-6 mx-auto">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h3 className="text-lg font-bold text-center text-gray-900 leading-6">
                    {title}
                </h3>

                <div className="mt-2">
                    <p className="text-sm text-center text-gray-500">
                        {message}
                    </p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
                    <button
                        type="button"
                        className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 sm:text-sm transition-colors"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`w-full sm:w-auto inline-flex justify-center rounded-lg px-4 py-2.5 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-all
                        ${isDangerous
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-500/30'
                            }`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
