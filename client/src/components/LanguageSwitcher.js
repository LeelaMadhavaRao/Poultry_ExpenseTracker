import { useTranslation } from "../i18n/i18n"

const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "hi", label: "HI", flag: "🇮🇳" },
  { code: "te", label: "TE", flag: "🇮🇳" },
]

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useTranslation()

  return (
    <div className="language-switcher">
      {LANGUAGES.map(({ code, label, flag }) => (
        <button
          key={code}
          className={`lang-btn ${language === code ? "active" : ""}`}
          onClick={() => changeLanguage(code)}
          title={label}
        >
          <span className="lang-flag">{flag}</span>
          <span className="lang-label">{label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
