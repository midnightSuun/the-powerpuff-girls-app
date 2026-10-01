import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { Suspense } from "react"

import { routing } from "@/i18n/routing"

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export default function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    return (
        <Suspense fallback={null}>
            <LocalizedLayout params={params}>{children}</LocalizedLayout>
        </Suspense>
    )
}

async function LocalizedLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    setRequestLocale(locale)

    const messages = (await import(`../../messages/${locale}.json`)).default

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
        </NextIntlClientProvider>
    )
}
