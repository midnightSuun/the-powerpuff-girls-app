import "./globals.css"

import type { Metadata } from "next"

import { ThemeProvider } from "@/components/theme-provider"

import {
    geistMono,
    geistSans,
    roboto,
    robotoCyrillic,
    robotoCyrillicExt,
} from "./fonts"

export const metadata: Metadata = {
    title: {
        default: "CV Builder",
        template: "%s | CV Builder",
    },
    description:
        "Create professional resumes and CVs easily with our modern web application",
    icons: {
        icon: "/favicon.ico",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            suppressHydrationWarning
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${robotoCyrillic.variable} ${robotoCyrillicExt.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col font-sans">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
