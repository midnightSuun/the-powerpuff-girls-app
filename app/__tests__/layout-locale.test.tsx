import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import LocaleLayout, { generateStaticParams } from "../[locale]/layout"

vi.mock("@/i18n/routing", () => ({
    routing: {
        locales: ["en", "ru"],
        defaultLocale: "en",
    },
}))

const mockNotFound = vi.fn()
vi.mock("next/navigation", () => ({
    notFound: () => {
        mockNotFound()
        return new Error("NEXT_NOT_FOUND")
    },
}))

vi.mock("next-intl", async (importOriginal) => {
    const actual = await importOriginal<typeof import("next-intl")>()
    return {
        ...actual,
        hasLocale: (locales: string[], locale: string | null) =>
            Boolean(locale && locales.includes(locale)),
        NextIntlClientProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => <div data-testid="intl-provider">{children}</div>,
    }
})

vi.mock("next-intl/server", () => ({
    setRequestLocale: vi.fn(),
}))

vi.mock("@/modules/auth/ui/auth-notification-listener", () => ({
    AuthNotificationListener: () => <div data-testid="auth-listener" />,
}))

vi.mock("@/modules/errors/ui/mobile-screen-blocker", () => ({
    MobileScreenBlocker: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mobile-blocker">{children}</div>
    ),
}))

vi.mock("sonner", () => ({
    Toaster: () => <div data-testid="toaster" />,
}))

vi.mock("../../../messages/en.json", () => ({
    default: { common: { title: "Title" } },
}))
vi.mock("../../../messages/ru.json", () => ({
    default: { common: { title: "Заголовок" } },
}))

describe("LocaleLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("generates static params correctly based on routing locales", () => {
        const params = generateStaticParams()
        expect(params).toEqual([{ locale: "en" }, { locale: "ru" }])
    })

    it("renders successfully with a valid supported locale", async () => {
        const params = Promise.resolve({ locale: "en" })

        await act(async () => {
            render(
                <LocaleLayout params={params}>
                    <div data-testid="child-content">Main Page Content</div>
                </LocaleLayout>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("intl-provider")).toBeInTheDocument()
        })

        expect(screen.getByTestId("mobile-blocker")).toBeInTheDocument()
        expect(screen.getByTestId("auth-listener")).toBeInTheDocument()
        expect(screen.getByTestId("toaster")).toBeInTheDocument()
        expect(screen.getByTestId("child-content")).toHaveTextContent(
            "Main Page Content",
        )
        expect(mockNotFound).not.toHaveBeenCalled()
    })

    it("calls notFound when an unsupported locale is provided", async () => {
        const params = Promise.resolve({ locale: "fr" })

        await act(async () => {
            render(
                <LocaleLayout params={params}>
                    <div data-testid="child-content">Main Page Content</div>
                </LocaleLayout>,
            )
        })

        await waitFor(() => {
            expect(mockNotFound).toHaveBeenCalled()
        })
    })
})
