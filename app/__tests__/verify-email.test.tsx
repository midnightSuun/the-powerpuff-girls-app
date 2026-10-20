import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import VerificationPage from "../[locale]/(public)/verify-email/page"

const mockGetSearchParams = vi.fn()
vi.mock("next/navigation", () => ({
    useSearchParams: () => ({
        get: mockGetSearchParams,
    }),
}))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => {
        if (key === "loading") return "Loading..."
        return key
    },
}))

const MockEmailVerification = vi.fn()
vi.mock("@/modules/auth/ui/email-verification", () => ({
    EmailVerification: (props: {
        email: string
        sendFailed: boolean
        accessToken?: string
    }) => {
        MockEmailVerification(props)
        return (
            <div data-testid="email-verification">
                <span data-testid="prop-email">{props.email}</span>
                <span data-testid="prop-send-failed">
                    {String(props.sendFailed)}
                </span>
                <span data-testid="prop-token">
                    {props.accessToken || "none"}
                </span>
            </div>
        )
    },
}))

describe("VerificationPage Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders loading fallback via Suspense initially or resolves to EmailVerification with default params", async () => {
        mockGetSearchParams.mockImplementation((key: string) => {
            if (key === "email") return null
            if (key === "sendFailed") return null
            if (key === "token") return null
            return null
        })

        render(<VerificationPage />)

        await waitFor(() => {
            expect(screen.getByTestId("email-verification")).toBeInTheDocument()
        })

        expect(screen.getByTestId("prop-email")).toHaveTextContent("")
        expect(screen.getByTestId("prop-send-failed")).toHaveTextContent(
            "false",
        )
        expect(screen.getByTestId("prop-token")).toHaveTextContent("none")

        expect(MockEmailVerification).toHaveBeenCalledWith({
            email: "",
            sendFailed: false,
            accessToken: undefined,
        })
    })

    it("passes search params correctly to EmailVerification when provided", async () => {
        mockGetSearchParams.mockImplementation((key: string) => {
            if (key === "email") return "test@example.com"
            if (key === "sendFailed") return "true"
            if (key === "token") return "secret-token-123"
            return null
        })

        render(<VerificationPage />)

        await waitFor(() => {
            expect(screen.getByTestId("email-verification")).toBeInTheDocument()
        })

        expect(screen.getByTestId("prop-email")).toHaveTextContent(
            "test@example.com",
        )
        expect(screen.getByTestId("prop-send-failed")).toHaveTextContent("true")
        expect(screen.getByTestId("prop-token")).toHaveTextContent(
            "secret-token-123",
        )

        expect(MockEmailVerification).toHaveBeenCalledWith({
            email: "test@example.com",
            sendFailed: true,
            accessToken: "secret-token-123",
        })
    })
})
