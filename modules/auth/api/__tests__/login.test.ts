import { redirect } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql, LoginDocument } from "@/gql"

import { setTokens } from "../../helpers/tokens"
import { login } from "../login"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    LoginDocument: "LoginDocument",
}))

vi.mock("../../helpers/tokens", () => ({
    setTokens: vi.fn(),
}))

vi.mock("next/navigation", () => ({
    redirect: vi.fn((url) => {
        throw new Error(`NEXT_REDIRECT:${url}`)
    }),
}))

describe("login Server Action", () => {
    const mockRequest = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(getGql as ReturnType<typeof vi.fn>).mockResolvedValue({
            request: mockRequest,
        })
    })

    it("returns error when email or password is missing", async () => {
        const formData = new FormData()
        formData.append("email", "")
        formData.append("password", "password123")

        const result = await login({}, formData)

        expect(result).toEqual({ error: "loginRequired" })
        expect(getGql).not.toHaveBeenCalled()
    })

    it("successfully logs in, sets tokens, and redirects to '/'", async () => {
        const formData = new FormData()
        formData.append("email", " test@example.com ")
        formData.append("password", "password123")

        mockRequest.mockResolvedValueOnce({
            login: {
                access_token: "mock-access-token",
                refresh_token: "mock-refresh-token",
            },
        })

        await expect(login({}, formData)).rejects.toThrow("NEXT_REDIRECT:/")

        expect(getGql).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith(LoginDocument, {
            auth: { email: "test@example.com", password: "password123" },
        })
        expect(setTokens).toHaveBeenCalledWith(
            "mock-access-token",
            "mock-refresh-token",
        )
        expect(redirect).toHaveBeenCalledWith("/")
    })

    it("returns localized loginFailed error when GraphQL request fails", async () => {
        const formData = new FormData()
        formData.append("email", "test@example.com")
        formData.append("password", "wrongpassword")

        mockRequest.mockRejectedValueOnce(new Error("Invalid credentials"))

        const result = await login({}, formData)

        expect(result).toEqual({ error: "loginFailed" })
        expect(setTokens).not.toHaveBeenCalled()
    })
})
