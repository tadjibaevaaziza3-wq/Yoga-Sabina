"use client"

import { createContext, useContext, ReactNode } from "react"
import { Locale } from "@/dictionaries/types"

interface DictionaryContextType {
    dictionary: any
    lang: Locale
}

const DictionaryContext = createContext<DictionaryContextType | null>(null)

export function DictionaryProvider({
    children,
    dictionary,
    lang,
}: {
    children: ReactNode
    dictionary: any
    lang: Locale
}) {
    return (
        <DictionaryContext.Provider value={{ dictionary, lang }}>
            {children}
        </DictionaryContext.Provider>
    )
}

export function useDictionary() {
    const context = useContext(DictionaryContext)
    if (!context) {
        throw new Error("useDictionary must be used within a DictionaryProvider")
    }
    return context
}


