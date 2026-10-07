import { headers } from "next/headers"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { Suspense } from "react"

import { routing } from "@/i18n/routing"
import { NotFoundPage } from "@/modules/errors/ui/not-found-page"

export const instant = false

async function NotFoundContent() {
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

export default function NotFound() {
    return (
        <Suspense fallback={null}>
            <NotFoundContent />
        </Suspense>
    )
}
