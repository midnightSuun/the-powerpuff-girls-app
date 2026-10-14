import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Page from "../[locale]/(public)/reset-password/page"

vi.mock("next-intl/server", () => ({
    getTranslations: vi.fn(async () => {
        const tFn = (key: string) => {
            if (key === "loading") return "Loading..."
            return key
        }
        return tFn
    }),
}))

vi.mock("@/modules/auth/ui/reset-password", () => ({
    ResetPasswordPage: () => (
        <div data-testid="reset-password-page">Reset Password Content</div>
    ),
}))

describe("ResetPassword Server Page", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders ResetPasswordPage correctly within Suspense", async () => {
        const ResolvedPage = await Page()

        await act(async () => {
            render(ResolvedPage)
        })

        await waitFor(() => {
            expect(
                screen.getByTestId("reset-password-page"),
            ).toBeInTheDocument()
        })

        expect(screen.getByTestId("reset-password-page")).toHaveTextContent(
            "Reset Password Content",
        )
    })
})
