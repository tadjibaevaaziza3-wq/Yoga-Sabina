import 'server-only'

export type Locale = 'uz' | 'ru'

const dictionaries = {
  uz: () => import('./uz.json').then((module) => module.default),
  ru: () => import('./ru.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries.uz()
}
