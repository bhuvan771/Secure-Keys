'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface CreateKeyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectId: string;
}

export default function CreateKey({ isOpen, onClose, onSuccess, projectId }: CreateKeyProps) {
    const [formData, setFormData] = useState({
        keyName: '',
        keyValue: '',
        keyType: 'ENV',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setFormData({ keyName: '', keyValue: '', keyType: 'ENV', description: '' });
                onSuccess();
                onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create key');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Key" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <Input
                    label="Key Name"
                    placeholder="e.g., API_KEY, DATABASE_URL"
                    value={formData.keyName}
                    onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key Type
                    </label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.keyType}
                        onChange={(e) => setFormData({ ...formData, keyType: e.target.value })}
                    >
                        <option value="ENV">Environment Variable</option>
                        <option value="API">API Key</option>
                        <option value="SSH">SSH Key</option>
                        <option value="DATABASE">Database Credential</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key Value
                    </label>
                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        rows={4}
                        placeholder="Paste your key value here..."
                        value={formData.keyValue}
                        onChange={(e) => setFormData({ ...formData, keyValue: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                    </label>
                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Brief description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={isLoading}>
                        Add Key
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
