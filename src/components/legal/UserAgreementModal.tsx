'use client';

/**
 * User Agreement Modal Component
 * 
 * Displays the user agreement and requires acceptance before allowing
 * access to course content. Cannot be dismissed without accepting.
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { USER_AGREEMENT_VERSION, getUserAgreementText } from '@/lib/legal/user-agreement';

interface UserAgreementModalProps {
    isOpen: boolean;
    onAccept: () => void;
    lang?: 'uz' | 'ru';
}

export default function UserAgreementModal({
    isOpen,
    onAccept,
    lang = 'uz'
}: UserAgreementModalProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);

    const agreementText = getUserAgreementText(lang);

    useEffect(() => {
        if (isOpen && contentRef.current) {
            const { scrollHeight, clientHeight } = contentRef.current;
            if (scrollHeight <= clientHeight + 2) {
                setHasScrolledToBottom(true);
            }
        }
    }, [isOpen, agreementText]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const isAtBottom =
            element.scrollHeight - element.scrollTop <= element.clientHeight + 2;

        if (isAtBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
        }
    };

    const handleAccept = async () => {
        if (!hasChecked || !hasScrolledToBottom) return;

        setIsAccepting(true);

        try {
            const response = await fetch('/api/user/accept-agreement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: USER_AGREEMENT_VERSION,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to accept agreement');
            }

            onAccept();
            router.refresh();
        } catch (error) {
            console.error('Error accepting agreement:', error);
            alert('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
        } finally {
            setIsAccepting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Foydalanuvchi shartnomasi
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Versiya {USER_AGREEMENT_VERSION}
                    </p>
                </div>

                {/* Agreement Text */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    onScroll={handleScroll}
                >
                    {agreementText}
                </div>

                {/* Scroll Indicator */}
                {!hasScrolledToBottom && (
                    <div className="px-6 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                            ⬇️ Iltimos, shartnomani to'liq o'qish uchun pastga aylantiring
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hasChecked}
                            onChange={(e) => setHasChecked(e.target.checked)}
                            disabled={!hasScrolledToBottom}
                            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            Men ushbu shartnomani to'liq o'qib chiqdim va uning barcha shartlariga roziman.
                            Men video materiallarni nusxalash, tarqatish yoki qayta sotish taqiqlanganligini tushunaman.
                        </span>
                    </label>

                    {/* Accept Button */}
                    <button
                        onClick={handleAccept}
                        disabled={!hasChecked || !hasScrolledToBottom || isAccepting}
                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 transition-colors"
                    >
                        {isAccepting ? 'Qabul qilinmoqda...' : 'Shartnomani qabul qilaman'}
                    </button>

                    {/* Warning */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Shartnomani qabul qilmasdan kurs materiallariga kirish imkoni bo'lmaydi
                    </p>
                </div>
            </div>
        </div>
    );
}


