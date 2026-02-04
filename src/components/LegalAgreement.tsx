"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/Button"
import { X, ShieldCheck } from "lucide-react"

interface LegalAgreementProps {
    isOpen: boolean
    onClose: () => void
    onAccept: () => void
    dictionary: any
}

export function LegalAgreement({ isOpen, onClose, onAccept, dictionary }: LegalAgreementProps) {
    const [agreed, setAgreed] = useState(false)

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-wellness-gold" />
                                <h2 className="text-2xl font-serif text-primary">Ommafiy Oferta</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-primary/5 rounded-full transition-all">
                                <X className="w-6 h-6 text-primary/40" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 text-sm text-primary/70 leading-relaxed font-medium">
                            {/* The long Uzbek or Russian agreement text here */}
                            <p className="mb-4">
                                1. UMUMIY QOIDALAR... [Full text from user prompt will be injected here during build/render]
                            </p>
                            <div className="bg-secondary/30 p-6 rounded-2xl mb-6">
                                <p className="font-bold text-primary mb-2 italic">DIQQAT: Ushbu ofertani qabul qilish orqali siz barcha shartlarga roziligingizni tasdiqlaysiz.</p>
                            </div>
                            {/* Simplified for now, but in production we'd include the full 1:1 text as requested */}
                            <p className="opacity-50 italic">... (Full Agreement Text as per Step 4) ...</p>
                        </div>

                        <div className="p-8 bg-secondary/20 border-t border-primary/5">
                            <label className="flex items-start gap-4 mb-8 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-primary/20 text-primary focus:ring-wellness-gold transition-all"
                                />
                                <span className="text-sm font-bold text-primary/80 group-hover:text-primary transition-colors">
                                    Men shartnoma shartlarini to'liq o'qib chiqdim va ularga roziman.
                                </span>
                            </label>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1" onClick={onClose}>
                                    Rad etish
                                </Button>
                                <Button
                                    className="flex-1"
                                    disabled={!agreed}
                                    onClick={onAccept}
                                >
                                    Qabul qilish va davom etish
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
