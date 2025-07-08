import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import React, { createContext, useContext, useEffect, useState } from "react";

import cs from "../locales/cs.json";
import en from "../locales/en.json";
import es from "../locales/es.json";

// Initialize i18n
const i18n = new I18n({
    en,
    es,
    cs,
});

// When a value is missing from a language it'll fallback to another language with the key present
i18n.enableFallback = true;
i18n.defaultLocale = "en";

type Language = "en" | "es" | "cs";

interface I18nContextType {
    locale: Language;
    t: (key: string, options?: any) => string;
    changeLanguage: (language: Language) => Promise<void>;
    availableLanguages: { code: Language; name: string }[];
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "bookstore_language";

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Language>("en");

    const availableLanguages = [
        { code: "en" as Language, name: "English" },
        { code: "es" as Language, name: "Español" },
        { code: "cs" as Language, name: "Čeština" },
    ];

    useEffect(() => {
        loadStoredLanguage();
    }, []);

    const loadStoredLanguage = async () => {
        try {
            const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedLanguage && ["en", "es", "cs"].includes(storedLanguage)) {
                const language = storedLanguage as Language;
                setLocale(language);
                i18n.locale = language;
            } else {
                // Use device locale if supported, otherwise default to English
                const deviceLocaleString =
                    Localization.locale ||
                    Localization.getLocales()[0]?.languageCode ||
                    "en";
                const deviceLocale = deviceLocaleString.split(
                    "-"
                )[0] as Language;
                const supportedLocale = ["en", "es", "cs"].includes(
                    deviceLocale
                )
                    ? deviceLocale
                    : "en";
                setLocale(supportedLocale);
                i18n.locale = supportedLocale;
            }
        } catch (error) {
            console.error("Error loading stored language:", error);
            setLocale("en");
            i18n.locale = "en";
        }
    };

    const changeLanguage = async (language: Language) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, language);
            setLocale(language);
            i18n.locale = language;
        } catch (error) {
            console.error("Error saving language:", error);
        }
    };

    const t = (key: string, options?: any) => {
        return i18n.t(key, options);
    };

    const value: I18nContextType = {
        locale,
        t,
        changeLanguage,
        availableLanguages,
    };

    return (
        <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
}
