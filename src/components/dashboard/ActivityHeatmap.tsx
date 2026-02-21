"use client"

import React from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'


interface ActivityHeatmapProps {
    data: { date: string; count: number; level: number }[]
    lang: string
}

export default function ActivityHeatmap({ data, lang }: ActivityHeatmapProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Default empty data if none provided to avoid crashes
    const safeData = data.length > 0 ? data : [{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }]

    if (!mounted) return <div className="h-[200px] w-full bg-[var(--card-bg)] rounded-[2rem] animate-pulse" />

    const labels = {
        months: lang === 'uz' ?
            ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'] :
            ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        weekdays: lang === 'uz' ?
            ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Jum', 'Shan'] :
            ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        totalCount: lang === 'uz' ? '{{count}} ta mashg\'ulot o\'tgan yili' : '{{count}} занятий за год',
        legend: {
            less: lang === 'uz' ? 'Kamroq' : 'Меньше',
            more: lang === 'uz' ? 'Ko\'proq' : 'Больше',
        },
    }

    return (
        <div className="w-full overflow-x-auto p-6 bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--primary)]/60 mb-6">
                {lang === 'uz' ? 'Yillik Faollik' : 'Активность за год'}
            </h3>
            <ActivityCalendar
                data={safeData}
                theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'], // Not used in forced light mode but kept for safety
                }}
                labels={labels}
                colorScheme="light"
                showWeekdayLabels
                renderBlock={(block, activity) => (
                    <div data-tooltip-id="activity-tooltip" data-tooltip-content={`${activity.count} ${lang === 'uz' ? 'mashg\'ulot' : 'занятий'} ${activity.date}`}>
                        {block}
                    </div>
                )}
            />
            <ReactTooltip id="activity-tooltip" />
        </div>
    )
}
