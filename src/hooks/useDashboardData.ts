
import { useState, useEffect } from 'react';

interface DashboardData {
    user: any;
    stats: {
        meditations: number;
        lessons: number;
        streak: number;
        points: number;
    };
    loading: boolean;
    error: string | null;
}

export function useDashboardData() {
    const [data, setData] = useState<DashboardData>({
        user: null,
        stats: {
            meditations: 0,
            lessons: 0,
            streak: 0,
            points: 0
        },
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Data (Profile, Courses, Progress)
                const res = await fetch('/api/user/me');
                if (!res.ok) throw new Error('Failed to fetch user data');

                const userData = await res.json();

                // Calculate Stats (Mock calculation for now, ideally backend provides this)
                // In a real app, calculate from userData.progress or userData.stats
                const stats = {
                    meditations: userData.progress?.meditationsCompleted || 0,
                    lessons: userData.progress?.lessonsCompleted || 0,
                    streak: userData.profile?.streak || 0,
                    points: userData.profile?.points || 0
                };

                setData({
                    user: userData,
                    stats,
                    loading: false,
                    error: null
                });
            } catch (err: any) {
                console.error("Dashboard Data Error:", err);
                setData(prev => ({ ...prev, loading: false, error: err.message }));
            }
        };

        fetchData();
    }, []);

    return data;
}
