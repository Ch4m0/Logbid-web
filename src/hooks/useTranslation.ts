import { useTranslation as useI18nTranslation } from 'react-i18next'

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const getCurrentLanguage = () => {
    return i18n.language
  }

  const isLanguage = (lng: string) => {
    return i18n.language === lng
  }

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isLanguage,
    i18n
  }
} 