
import { prisma } from '@/lib/prisma';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (stats: UserStats) => boolean;
}

interface UserStats {
    totalYogaTime: number;
    currentStreak: number;
    longestStreak: number;
    lessonsCompleted: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_step',
        title: 'Birinchi Qadam',
        description: 'Birinchi darsni yakunladingiz!',
        icon: '🌱',
        condition: (stats) => stats.lessonsCompleted >= 1
    },
    {
        id: 'streak_3',
        title: 'Istiqbolli Boshlanish',
        description: '3 kun ketma-ket shug\'ullandingiz!',
        icon: '🔥',
        condition: (stats) => stats.currentStreak >= 3
    },
    {
        id: 'streak_7',
        title: 'Haftalik Qahramon',
        description: 'Bir hafta to\'xtovsiz amaliyot!',
        icon: '🏆',
        condition: (stats) => stats.currentStreak >= 7
    },
    {
        id: 'yoga_master_10h',
        title: 'Yoga Ustasi',
        description: '10 soatlik amaliyot!',
        icon: '🧘‍♂️',
        condition: (stats) => stats.totalYogaTime >= 36000 // 10 hours
    }
];

export class GamificationService {
    static async updateStreaks(userId: string): Promise<void> {
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) return;

        const now = new Date();
        const lastActivity = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null;

        let currentStreak = profile.currentStreak || 0;
        let longestStreak = profile.longestStreak || 0;

        if (lastActivity) {
            const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                currentStreak++;
            } else if (diffDays > 1) {
                // Streak broken
                currentStreak = 1;
            }
            // If diffDays == 0 (same day), do nothing
        } else {
            // First activity ever
            currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }

        await prisma.profile.update({
            where: { userId },
            data: {
                currentStreak,
                longestStreak,
                lastActivityDate: now
            }
        });
    }

    static async checkAchievements(userId: string): Promise<string[]> {
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) return [];

        const lessonsCompleted = await prisma.enhancedVideoProgress.count({
            where: { userId, completed: true }
        });

        const stats: UserStats = {
            totalYogaTime: profile.totalYogaTime || 0,
            currentStreak: profile.currentStreak || 0,
            longestStreak: profile.longestStreak || 0,
            lessonsCompleted
        };

        const existingAchievements = (profile.achievements as any[])?.map((a: any) => a.id) || [];
        const newAchievements: string[] = [];
        const updatedAchievements = [...(profile.achievements as any[] || [])];

        for (const achievement of ACHIEVEMENTS) {
            if (!existingAchievements.includes(achievement.id)) {
                if (achievement.condition(stats)) {
                    newAchievements.push(achievement.id);
                    updatedAchievements.push({
                        id: achievement.id,
                        date: new Date().toISOString()
                    });
                }
            }
        }

        if (newAchievements.length > 0) {
            await prisma.profile.update({
                where: { userId },
                data: { achievements: updatedAchievements }
            });
        }

        return newAchievements;
    }
}
