"use client";

import nextDynamic from 'next/dynamic';

const ReactAdminApp = nextDynamic(
    () => import('@/components/admin/ReactAdminApp').then((mod) => mod.ReactAdminApp),
    { ssr: false, loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui' }}><p>Yuklanmoqda...</p></div> }
);

export default function AdminPage() {
    return <ReactAdminApp />;
}
