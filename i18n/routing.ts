import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
    locales: ["en", "fr", "de", "it", "pl", "pt", "ru", "es", "uk"],
    defaultLocale: "en",
})
