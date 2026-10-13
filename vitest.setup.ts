import "@testing-library/jest-dom/vitest"

import type { ReactNode } from "react"
import { vi } from "vitest"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    })),
    usePathname: vi.fn(() => ""),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    useParams: vi.fn(() => ({})),
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
    notFound: vi.fn(),
}))

vi.mock("next-intl", () => {
    const tFn = (key: string) => key
    tFn.rich = (
        key: string,
        values?: Record<
            string,
            string | number | ReactNode | ((chunks: ReactNode) => ReactNode)
        >,
    ) => {
        if (values && typeof values === "object") {
            const count = "count" in values ? values.count : undefined
            return typeof count === "number" || typeof count === "string"
                ? `confirmation-${count}`
                : key
        }
        return key
    }

    return {
        useTranslations: () => tFn,
        useLocale: () => "en",
    }
})

vi.mock("next-intl/server", () => ({
    getTranslations: vi.fn(async () => {
        const tFn = (key: string) => key
        tFn.rich = (
            key: string,
            _values?: Record<
                string,
                string | number | ReactNode | ((chunks: ReactNode) => ReactNode)
            >,
        ) => key
        return tFn
    }),
}))
