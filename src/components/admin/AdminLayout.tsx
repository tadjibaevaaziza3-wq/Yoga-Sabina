import React from 'react';
import { Container } from '@/components/ui/Container';

export function AdminLayout({ children, title }: { children: React.ReactNode, title?: string }) {
    return (
        <div className="admin-layout min-h-screen bg-gray-50">
            <Container className="py-8">
                {title && <h1 className="text-3xl font-bold mb-8">{title}</h1>}
                {children}
            </Container>
        </div>
    );
}
