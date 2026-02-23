"use client";

import dynamic from 'next/dynamic';

const ReactAdminApp = dynamic(
    () => import('@/components/admin/ReactAdminApp').then((mod) => mod.ReactAdminApp),
    { ssr: false }
);

export default function AdminPage() {
    return <ReactAdminApp />;
}
