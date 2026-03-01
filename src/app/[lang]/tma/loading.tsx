export default function TMALoading() {
    return (
        <div className="min-h-screen bg-[#f6f9fe] flex flex-col items-center justify-center">
            <div className="space-y-6 text-center">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 border-t-2 border-[#114539] rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-[#114539]">Baxtli Men</h2>
                    <p className="text-xs text-[#114539]/50 uppercase tracking-widest">Yuklanmoqda...</p>
                </div>
            </div>
        </div>
    );
}
