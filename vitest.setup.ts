import "@testing-library/jest-dom/vitest"

import { vi } from "vitest"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

vi.mock("next-intl/server", () => ({
    getTranslations: vi.fn(async () => (key: string) => key),
}))
