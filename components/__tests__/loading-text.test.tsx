import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { LoadingText } from "../loading-text"

const mockTranslate = vi.fn((key: string) => `translated_${key}`)
const mockUseTranslations = vi.fn((_namespace?: string) => mockTranslate)

vi.mock("next-intl", () => ({
    useTranslations: (namespace: string) => mockUseTranslations(namespace),
}))

describe("LoadingText", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("calls useTranslations with the correct namespace and renders loading text", () => {
        render(<LoadingText namespace="Users" />)

        expect(mockUseTranslations).toHaveBeenCalledWith("Users")
        expect(mockTranslate).toHaveBeenCalledWith("loading")
        expect(screen.getByText("translated_loading")).toBeInTheDocument()
    })

    it("works correctly with different namespaces", () => {
        render(<LoadingText namespace="Skills" />)

        expect(mockUseTranslations).toHaveBeenCalledWith("Skills")
        expect(screen.getByText("translated_loading")).toBeInTheDocument()
    })
})
