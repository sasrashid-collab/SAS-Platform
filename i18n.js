// بڕەتاڵیکۆ مۆدیۆل (Localization Module)

export class LocalizationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'ku';
        this.translations = {};
    }

    async loadTranslations() {
        try {
            const response = await fetch('/i18n.json');
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
    }

    getLanguage() {
        return this.currentLanguage;
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateDOM();
    }

    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    updateDOM() {
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.currentLanguage === 'en' ? 'ltr' : 'rtl';
    }

    getSupportedLanguages() {
        return ['ku', 'ar', 'en'];
    }

    getLanguageNames() {
        return {
            'ku': '🇮🇶 کوردی',
            'ar': '🇸🇦 العربية',
            'en': '🇺🇸 English'
        };
    }
}

export default new LocalizationManager();
