import { act, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import NotFound from "../not-found"

const mockGetHeader = vi.fn()
vi.mock("next/headers", () => ({
    headers: vi.fn(async () => ({
        get: mockGetHeader,
    })),
}))

vi.mock("@/i18n/routing", () => ({
    routing: {
        locales: ["en", "ru"],
        defaultLocale: "en",
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

vi.mock("@/modules/errors/ui/not-found-page", () => ({
    NotFoundPage: () => (
        <div data-testid="not-found-page">Not Found Page Content</div>
    ),
}))

vi.mock("../../messages/en.json", () => ({
    default: { error: { title: "Not Found" } },
}))
vi.mock("../../messages/ru.json", () => ({
    default: { error: { title: "Не найдено" } },
}))

describe("NotFound Page", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders with default locale when x-locale header is missing or unsupported", async () => {
        mockGetHeader.mockReturnValue(null)

        await act(async () => {
            render(
                <React.Suspense fallback={null}>
                    <NotFound />
                </React.Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("not-found-page")).toBeInTheDocument()
        })
        expect(screen.getByTestId("intl-provider")).toBeInTheDocument()
    })

    it("renders with requested supported locale from x-locale header", async () => {
        mockGetHeader.mockReturnValue("ru")

        await act(async () => {
            render(
                <React.Suspense fallback={null}>
                    <NotFound />
                </React.Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("not-found-page")).toBeInTheDocument()
        })
        expect(screen.getByTestId("intl-provider")).toBeInTheDocument()
    })
})
