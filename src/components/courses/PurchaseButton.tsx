"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { useDictionary } from "@/components/providers/DictionaryProvider"

interface PurchaseButtonProps {
    courseId: string
    courseTitle: string
    coursePrice: number
    lang: string
}

export function PurchaseButton({ courseId, courseTitle, coursePrice, lang }: PurchaseButtonProps) {
    const { dictionary } = useDictionary()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handlePurchase = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push(`/${lang}/login?returnUrl=/${lang}/courses/${courseId}`)
            return
        }

        // Redirect to checkout page
        router.push(`/${lang}/checkout?id=${courseId}&type=course`)
        setLoading(false)
    }

    return (
        <Button
            className="w-full mb-4 py-6 text-lg"
            onClick={handlePurchase}
            disabled={loading}
        >
            {loading ? "..." : dictionary.common.buy}
        </Button>
    )
}


