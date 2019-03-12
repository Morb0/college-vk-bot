const translations = {
  en: require('../lang/en.json'),
  ru: require('../lang/ru.json'),
};

export const t = (tag: string): string => {
  return translations[process.env.TRANSLATION || 'en'][tag];
};
