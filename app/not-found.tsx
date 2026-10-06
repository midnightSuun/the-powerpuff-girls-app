import { headers } from "next/headers"
import { hasLocale, NextIntlClientProvider } from "next-intl"

import { routing } from "@/i18n/routing"
import { NotFoundPage } from "@/modules/errors/ui/not-found-page"

export default async function NotFound() {
    const requestHeaders = await headers()
    const requestedLocale = requestHeaders.get("x-locale")
    const locale = hasLocale(routing.locales, requestedLocale)
        ? requestedLocale
        : routing.defaultLocale
    const messages = (await import(`../messages/${locale}.json`)).default

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <NotFoundPage />
        </NextIntlClientProvider>
    )
}
