
'use client';

import React, { useState, useEffect } from 'react';
import DailyCheckInModal from '@/components/tma/DailyCheckInModal';
import StreakWidget from '@/components/tma/gamification/StreakWidget';
import AchievementsList from '@/components/tma/gamification/AchievementsList';


interface UserDashboardClientProps {
    userData: any;
    lang: string;
}

export default function UserDashboardClient({ userData, lang }: UserDashboardClientProps) {
    const [showCheckIn, setShowCheckIn] = useState(false);

    useEffect(() => {
        const checkDailyStatus = async () => {
            try {
                const res = await fetch('/api/ai/check-in');
                if (res.ok) {
                    const data = await res.json();
                    if (!data.checkedIn) {
                        // Show modal after a short delay
                        setTimeout(() => setShowCheckIn(true), 2000);
                    }
                }
            } catch (e) {
                console.error('Check-in status error', e);
            }
        };
        checkDailyStatus();
    }, []);

    return (
        <div className="space-y-12">
            <DailyCheckInModal
                isOpen={showCheckIn}
                onClose={() => setShowCheckIn(false)}
                userName={userData?.firstName || 'Azizim'}
            />

            {/* Gamification Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--foreground)] opacity-60">
                        {lang === 'uz' ? "Yutuqlar va Statistika" : "Достижения и Статистика"}
                    </h4>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <StreakWidget streak={userData?.profile?.currentStreak || 0} />
                    <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm">
                        <AchievementsList unlockedIds={userData?.profile?.achievements || []} />
                    </div>
                </div>
            </section>


        </div>
    );
}
