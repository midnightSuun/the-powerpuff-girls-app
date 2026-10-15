import { ClientError } from "graphql-request"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql, LoginDocument, SignupDocument } from "@/gql"

import { setTokens } from "../../helpers/tokens"
import { signup } from "../signup"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    SignupDocument: "SignupDocument",
    LoginDocument: "LoginDocument",
}))

vi.mock("../../helpers/tokens", () => ({
    setTokens: vi.fn(),
}))

describe("signup Server Action", () => {
    const mockRequest = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(getGql as ReturnType<typeof vi.fn>).mockResolvedValue({
            request: mockRequest,
        })
    })

    it("returns error when required fields are missing", async () => {
        const formData = new FormData()
        formData.append("email", "test@example.com")
        formData.append("password", "Password123!")
        formData.append("confirmPassword", "")

        const result = await signup({}, formData)

        expect(result).toEqual({ error: "signupRequired" })
        expect(getGql).not.toHaveBeenCalled()
    })

    it("returns error when passwords do not match", async () => {
        const formData = new FormData()
        formData.append("email", "test@example.com")
        formData.append("password", "Password123!")
        formData.append("confirmPassword", "DifferentPassword123!")

        const result = await signup({}, formData)

        expect(result).toEqual({ error: "passwordsDoNotMatch" })
        expect(getGql).not.toHaveBeenCalled()
    })

    it("successfully signs up, sets tokens, and returns verification redirect", async () => {
        const formData = new FormData()
        formData.append("email", " test@example.com ")
        formData.append("password", "Password123!")
        formData.append("confirmPassword", "Password123!")

        mockRequest.mockResolvedValueOnce({
            signup: {
                access_token: "signup-access-token",
                refresh_token: "signup-refresh-token",
            },
        })

        const result = await signup({}, formData)

        expect(getGql).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith(SignupDocument, {
            auth: {
                email: "test@example.com",
                password: "Password123!",
                confirmPassword: "Password123!",
            },
        })
        expect(setTokens).toHaveBeenCalledWith(
            "signup-access-token",
            "signup-refresh-token",
        )
        expect(result).toEqual({
            redirectTo: "/verify-email?email=test%40example.com",
            confirmationEmailSent: true,
        })
    })

    it("returns emailAlreadyTaken error when user already exists", async () => {
        const formData = new FormData()
        formData.append("email", "existing@example.com")
        formData.append("password", "Password123!")
        formData.append("confirmPassword", "Password123!")

        const clientError = new ClientError(
            {
                status: 400,
                headers: new Headers(),
                errors: [{ message: "userAlreadyExists" }],
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest.mockRejectedValueOnce(clientError)

        const result = await signup({}, formData)

        expect(result).toEqual({ error: "emailAlreadyTaken" })
        expect(setTokens).not.toHaveBeenCalled()
    })

    it("handles failedToSendEmail by falling back to login", async () => {
        const formData = new FormData()
        formData.append("email", "test@example.com")
        formData.append("password", "Password123!")
        formData.append("confirmPassword", "Password123!")

        const emailError = new ClientError(
            {
                status: 400,
                headers: new Headers(),
                errors: [{ message: "failedToSendEmail" }],
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest.mockRejectedValueOnce(emailError).mockResolvedValueOnce({
            login: {
                access_token: "login-access-token",
                refresh_token: "login-refresh-token",
            },
        })

        const result = await signup({}, formData)

        expect(mockRequest).toHaveBeenCalledTimes(2)
        expect(mockRequest).toHaveBeenNthCalledWith(2, LoginDocument, {
            auth: {
                email: "test@example.com",
                password: "Password123!",
            },
        })
        expect(setTokens).toHaveBeenCalledWith(
            "login-access-token",
            "login-refresh-token",
        )
        expect(result).toEqual({
            redirectTo: "/verify-email?email=test%40example.com",
            confirmationEmailSent: false,
        })
    })

    it("returns signupEmailFailed error when email sending fails and subsequent automatic login also fails", async () => {
        const formData = new FormData()
        formData.append("email", "test@example.com")
        formData.append("password", "Password123!")
        formData.append("confirmPassword", "Password123!")

        const emailError = new ClientError(
            {
                status: 400,
                headers: new Headers(),
                errors: [{ message: "failedToSendEmail" }],
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest
            .mockRejectedValueOnce(emailError)
            .mockRejectedValueOnce(new Error("Login failed"))

        const result = await signup({}, formData)

        expect(mockRequest).toHaveBeenCalledTimes(2)
        expect(setTokens).not.toHaveBeenCalled()
        expect(result).toEqual({ error: "signupEmailFailed" })
    })

    it("returns signupEmailFailed error when email sending fails and subsequent automatic login also fails", async () => {
        const formData = new FormData()
        formData.append("email", "test@example.com")
        formData.append("password", "Password123!")
        formData.append("confirmPassword", "Password123!")

        const emailError = new ClientError(
            {
                status: 400,
                headers: new Headers(),
                errors: [{ message: "failedToSendEmail" }],
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest
            .mockRejectedValueOnce(emailError)
            .mockRejectedValueOnce(new Error("Login failed"))

        const result = await signup({}, formData)

        expect(mockRequest).toHaveBeenCalledTimes(2)
        expect(setTokens).not.toHaveBeenCalled()
        expect(result).toEqual({ error: "signupEmailFailed" })
    })
})
