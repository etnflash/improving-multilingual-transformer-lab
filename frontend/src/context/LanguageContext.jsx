import { createContext } from 'react'

const LanguageContext = createContext({
  uiLanguage: 'en',
  setUiLanguage: () => {},
})

export default LanguageContext
