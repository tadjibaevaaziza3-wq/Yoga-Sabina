/**
 * Sales Intelligence Module
 * 
 * Detects purchase hesitation and generates value-aligned
 * responses for non-subscribers.
 */

interface SalesContext {
    message: string
    lang: 'uz' | 'ru'
    emotionalState: string
    healthIssues?: string | null
    gender?: string | null
    age?: number | null
}

// ─── Hesitation Detection ───

const HESITATION_KEYWORDS = [
    // UZ
    'qimmat', 'keyin ko\'raman', 'o\'ylab ko\'raman', 'hozir emas', 'boshqa kurs',
    'farqi nima', 'pulim yo\'q', 'arzimas', 'kerakmi', 'foydasi bormi',
    // RU
    'дорого', 'потом посмотрю', 'подумаю', 'не сейчас', 'другой курс',
    'какая разница', 'нет денег', 'стоит ли', 'нужно ли', 'есть ли смысл',
    // EN
    'too expensive', 'maybe later', 'not sure', 'is it worth'
]

const COMPARISON_KEYWORDS = [
    'farqi', 'qaysi yaxshiroq', 'taqqoslash', 'qanday kurs',
    'разница', 'какой лучше', 'сравнить', 'какой курс',
    'difference', 'which is better', 'compare'
]

export function detectSalesOpportunity(message: string): 'hesitation' | 'comparison' | 'objection' | null {
    const lower = message.toLowerCase()

    if (HESITATION_KEYWORDS.some(k => lower.includes(k))) return 'hesitation'
    if (COMPARISON_KEYWORDS.some(k => lower.includes(k))) return 'comparison'

    return null
}

// ─── Sales Response Generator ───

export function generateSalesResponse(ctx: SalesContext): string {
    const { lang, emotionalState, healthIssues, gender, age } = ctx

    // Build personalized benefit based on health profile
    const benefit = getBenefitMatch(healthIssues, gender, age, lang)

    // Emotional alignment opener
    const opener = getEmotionalAlignmentOpener(emotionalState, lang)

    if (lang === 'uz') {
        return `${opener}

${benefit}

✨ Har bir kursimiz Sabina murabbiyning professional video darslarini, shaxsiy mashqlar dasturini va 24/7 AI yordamchini o'z ichiga oladi.

🎁 Birinchi 2 ta dars bepul — ko'rib, o'zingiz hal qiling!
Batafsil ma'lumot: @Sabina_Radjapovna 🙏`
    }

    return `${opener}

${benefit}

✨ Каждый курс включает профессиональные видеоуроки Сабины, персональную программу упражнений и AI-помощника 24/7.

🎁 Первые 2 урока бесплатно — посмотрите и решите сами!
Подробности: @Sabina_Radjapovna 🙏`
}

// ─── Benefit Matching ───

function getBenefitMatch(
    healthIssues: string | null | undefined,
    gender: string | null | undefined,
    age: number | null | undefined,
    lang: 'uz' | 'ru'
): string {
    const issues = (healthIssues || '').toLowerCase()

    // Back pain
    if (issues.includes('bel') || issues.includes('umurtqa') || issues.includes('спин') || issues.includes('позвоноч')) {
        return lang === 'uz'
            ? '🎯 Sizning umurtqa muammolaringiz uchun kursimizda 12 ta maxsus mashq bor — ular sekin va xavfsiz ishlaydi.'
            : '🎯 Для ваших проблем со спиной в курсе есть 12 специальных упражнений — они работают мягко и безопасно.'
    }

    // Hormonal (women 40+)
    if (gender === 'female' && age && age >= 40) {
        return lang === 'uz'
            ? '🌸 "Baxtli Ayollar Klubi" kursi gormonal muvozanat va energiya tiklashga qaratilgan — 40+ yoshdagi ayollar uchun maxsus.'
            : '🌸 Курс "Клуб счастливых женщин" направлен на гормональный баланс и восстановление энергии — специально для женщин 40+.'
    }

    // Stress
    if (issues.includes('stress') || issues.includes('стресс') || issues.includes('uxlolma') || issues.includes('бессонн')) {
        return lang === 'uz'
            ? '🧘 Stressni boshqarish va yaxshi uyqu uchun maxsus meditatsiya va nafas mashqlari kursi mavjud.'
            : '🧘 Для управления стрессом и качественного сна есть специальный курс медитации и дыхательных практик.'
    }

    // Men
    if (gender === 'male') {
        return lang === 'uz'
            ? '💪 "Erkaklar uchun Yoga Terapiya" — umurtqa salomatligi, gormonlar va energiya tiklash uchun.'
            : '💪 "Йога-терапия для мужчин" — здоровье позвоночника, гормоны и восстановление энергии.'
    }

    // Default
    return lang === 'uz'
        ? '🌟 Professional yoga terapiya kurslari — salomatlik, energiya va ichki xotirjamlik uchun.'
        : '🌟 Профессиональные курсы йога-терапии — для здоровья, энергии и внутреннего спокойствия.'
}

// ─── Emotional Alignment ───

function getEmotionalAlignmentOpener(state: string, lang: 'uz' | 'ru'): string {
    const openers: Record<string, { uz: string; ru: string }> = {
        insecure: {
            uz: 'Ko\'pchilik bizning a\'zolarimiz ham xuddi shunday boshlaganlar — va endi o\'zlarining natijalariga hayron qolishmoqda.',
            ru: 'Многие наши участники начинали точно так же — и сейчас поражены своими результатами.',
        },
        doubting: {
            uz: 'Tushunaman, investitsiya qilishdan oldin aniq foyda ko\'rmoqchi bo\'lsiz. Keling, ko\'rsataman...',
            ru: 'Понимаю, хочется видеть конкретную пользу перед инвестицией. Давайте покажу...',
        },
        tired: {
            uz: 'Bilaman, ba\'zan boshlash eng qiyin qadam. Lekin eng qisqa mashq ham katta farq qiladi.',
            ru: 'Знаю, иногда начать — самый сложный шаг. Но даже короткая практика делает большую разницу.',
        },
        frustrated: {
            uz: 'Sizning sabrligingiz va izlanishingiz — natijaga erishish belgisi. Keling, oddiy qadamdan boshlaylik.',
            ru: 'Ваше терпение и поиск — признак движения к результату. Давайте начнём с простого шага.',
        },
    }

    const match = openers[state]
    if (match) return match[lang]

    return lang === 'uz'
        ? 'Sizning salomatligingiz — eng yaxshi investitsiya.'
        : 'Ваше здоровье — лучшая инвестиция.'
}
