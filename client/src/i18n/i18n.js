import { createContext, useContext, useState, useCallback, useMemo } from "react"
import en from "./translations/en"
import te from "./translations/te"
import hi from "./translations/hi"

const translations = { en, te, hi }

const LanguageContext = createContext(undefined)

function resolvePath(obj, path) {
  const keys = path.split(".")
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined
    current = current[key]
  }
  return current
}

function buildNested(flatObj) {
  const nested = {}
  for (const [key, value] of Object.entries(flatObj)) {
    const keys = key.split(".")
    let current = nested
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
  }
  return nested
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem("language")
      if (stored && translations[stored]) return stored
    } catch {
      // localStorage not available
    }
    return "en"
  })

  const setLanguage = useCallback((lang) => {
    if (!translations[lang]) return
    setLanguageState(lang)
    try {
      localStorage.setItem("language", lang)
    } catch {
      // localStorage not available
    }
  }, [])

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang)
  }, [setLanguage])

  const t = useCallback(
    (key, fallback) => {
      const nested = buildNested(translations[language])
      const value = resolvePath(nested, key)
      if (value !== undefined) return value
      const enNested = buildNested(translations.en)
      const enValue = resolvePath(enNested, key)
      return enValue !== undefined ? enValue : fallback ?? key
    },
    [language]
  )

  const value = useMemo(
    () => ({ language, setLanguage, changeLanguage, t }),
    [language, setLanguage, changeLanguage, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}

export default LanguageContext
