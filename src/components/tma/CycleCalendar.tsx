'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CycleCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];

    const toggleDate = (date: string) => {
        if (selectedDates.includes(date)) {
            setSelectedDates(selectedDates.filter(d => d !== date));
        } else {
            setSelectedDates([...selectedDates, date]);
        }
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
                <h3 className="text-2xl font-editorial font-bold text-[#114539]">
                    {monthNames[currentDate.getMonth()]}
                </h3>
                <p className="text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest">
                    Tayyorlik darajasi: Yuqori
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                    className="w-10 h-10 rounded-xl bg-white border border-[#114539]/5 flex items-center justify-center shadow-soft active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-5 h-5 text-[#114539]" />
                </button>
                <button
                    onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                    className="w-10 h-10 rounded-xl bg-white border border-[#114539]/5 flex items-center justify-center shadow-soft active:scale-95 transition-all"
                >
                    <ChevronRight className="w-5 h-5 text-[#114539]" />
                </button>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        // Fill empty spots
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="aspect-square" />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const isSelected = selectedDates.includes(dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <motion.button
                    key={day}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleDate(dateStr)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all relative ${isSelected
                            ? 'bg-[#114539] text-white shadow-lg shadow-[#114539]/20'
                            : isToday
                                ? 'bg-[#114539]/5 text-[#114539] border border-[#114539]/10'
                                : 'text-[#114539]/60 hover:bg-[#114539]/5'
                        }`}
                >
                    {day}
                    {isToday && !isSelected && <div className="w-1 h-1 bg-[#114539] rounded-full mt-1" />}
                </motion.button>
            );
        }

        return days;
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#114539]/5 shadow-soft space-y-8">
            {renderHeader()}

            <div className="grid grid-cols-7 gap-2 mb-4">
                {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map(d => (
                    <div key={d} className="text-[10px] font-black text-[#114539]/20 text-center uppercase py-2">
                        {d}
                    </div>
                ))}
                {renderDays()}
            </div>

            <div className="pt-8 border-t border-[#114539]/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#114539]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#114539]/60">Hayz kunlari</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#114539]">{selectedDates.length} kun</span>
                </div>
                <button className="w-full py-5 bg-[#114539]/5 rounded-2xl text-[10px] font-bold text-[#114539] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                    <Plus className="w-4 h-4" /> Ma'lumot qo'shish
                </button>
            </div>
        </div>
    );
}
