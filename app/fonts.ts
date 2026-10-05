import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import localFont from "next/font/local"

// Google Fonts sometimes returns extensionless URLs that Turbopack cannot parse.
// These files are bundled, so the build never calls fonts.googleapis.com.
export const geistSans = GeistSans
export const geistMono = GeistMono

export const roboto = localFont({
    src: [
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-latin-500-normal.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-latin-600-normal.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-roboto",
    display: "swap",
})

export const robotoCyrillic = localFont({
    src: [
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-400-normal.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-500-normal.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-600-normal.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-700-normal.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-roboto-cyrillic",
    display: "swap",
})

export const robotoCyrillicExt = localFont({
    src: [
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-ext-400-normal.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-ext-500-normal.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-ext-600-normal.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/roboto/files/roboto-cyrillic-ext-700-normal.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-roboto-cyrillic-ext",
    display: "swap",
    preload: false,
})
