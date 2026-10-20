import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { Suspense } from "react"
import { Toaster } from "sonner"

import { routing } from "@/i18n/routing"
import { AuthNotificationListener } from "@/modules/auth/ui/auth-notification-listener"
import { MobileScreenBlocker } from "@/modules/errors/ui/mobile-screen-blocker"

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

type Props = {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

const LocaleContent = async ({ children, params }: Props) => {
    const { locale } = await params

    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    setRequestLocale(locale)

    const messages = (await import(`../../messages/${locale}.json`)).default

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <MobileScreenBlocker>
                {children}
                <AuthNotificationListener />
            </MobileScreenBlocker>
        </NextIntlClientProvider>
    )
}

export default function LocaleLayout({ children, params }: Props) {
    return (
        <Suspense fallback={null}>
            <LocaleContent params={params}>{children}</LocaleContent>
            <Toaster position="top-right" closeButton={true} />
        </Suspense>
    )
}
