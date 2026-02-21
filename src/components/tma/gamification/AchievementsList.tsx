
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/gamification/gamification-service';

interface AchievementsListProps {
    unlockedIds: string[];
}

export default function AchievementsList({ unlockedIds = [] }: AchievementsListProps) {
    // Only show first 4 achievements to keep dashboard clean
    // In a real app, we'd have a "See All" page
    const distinctAchievements = ACHIEVEMENTS.slice(0, 4);

    return (
        <div className="grid grid-cols-2 gap-3">
            {distinctAchievements.map((achievement) => {
                const isUnlocked = unlockedIds.some((id: any) =>
                    typeof id === 'string' ? id === achievement.id : id.id === achievement.id
                );

                return (
                    <motion.div
                        key={achievement.id}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-[20px] border relative overflow-hidden group transition-all ${isUnlocked
                                ? 'bg-white border-[#114539]/10 shadow-soft'
                                : 'bg-[#f6f9fe] border-transparent opacity-60 grayscale'
                            }`}
                    >
                        <div className="relative z-10 flex flex-col items-center text-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${isUnlocked ? 'bg-[#114539]/5' : 'bg-gray-200'
                                }`}>
                                {isUnlocked ? achievement.icon : <Lock className="w-4 h-4 text-gray-400" />}
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#114539] mb-1">
                                    {achievement.title}
                                </h4>
                                <p className="text-[9px] opacity-60 leading-tight">
                                    {achievement.description}
                                </p>
                            </div>
                        </div>

                        {isUnlocked && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-bl-[3rem] -mt-2 -mr-2" />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
