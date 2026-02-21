
import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakWidgetProps {
    streak: number;
    loading?: boolean;
}

export default function StreakWidget({ streak, loading = false }: StreakWidgetProps) {
    if (loading) return <div className="h-24 bg-white rounded-[2rem] animate-pulse" />;

    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-[2rem] text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-5 h-5 text-yellow-200 fill-yellow-200 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Kunlik Seriya</span>
                    </div>
                    <div className="text-4xl font-editorial font-bold flex items-baseline gap-1">
                        {streak} <span className="text-lg font-medium opacity-60">kun</span>
                    </div>
                    <p className="text-[10px] opacity-60 mt-1 max-w-[150px]">
                        Har kuni mashq qiling va seriyani saqlab qoling!
                    </p>
                </div>

                {/* Fire Animation Effect */}
                <div className="relative">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-yellow-400 blur-[20px] rounded-full"
                    />
                    <Flame className="w-16 h-16 text-white relative z-10 drop-shadow-lg" />
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>
    );
}
