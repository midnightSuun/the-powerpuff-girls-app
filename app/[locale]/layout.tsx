import { notFound } from "next/navigation"
import { connection } from "next/server"
import { NextIntlClientProvider } from "next-intl"
import { hasLocale } from "next-intl"

import { routing } from "@/i18n/routing"

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    await connection()

    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    const messages = (await import(`../../messages/${locale}.json`)).default

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
        </NextIntlClientProvider>
    )
}
