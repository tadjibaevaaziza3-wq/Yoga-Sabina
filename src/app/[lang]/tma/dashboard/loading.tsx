export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-[#f6f9fe] flex flex-col items-center justify-center">
            <div className="space-y-6 text-center">
                <div className="w-16 h-16 border-t-2 border-[#114539] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#114539]/50 uppercase tracking-widest">Yuklanmoqda...</p>
            </div>
        </div>
    );
}
