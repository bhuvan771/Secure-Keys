import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
    return (
        <div
            className={`
        bg-white rounded-xl border border-gray-100 
        shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
        ${hover ? 'hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 border-b border-gray-50 ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl ${className}`}>
            {children}
        </div>
    );
}
