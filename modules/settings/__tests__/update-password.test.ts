import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"

import { updateSettingsPasswordAction } from "../api/update-password"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    ChangePasswordDocument: "ChangePasswordDocument",
}))

describe("updateSettingsPasswordAction", () => {
    const mockRequest = vi.fn()
    const mockCookieGet = vi.fn()

    const validData = {
        password: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
    }

    beforeEach(async () => {
        vi.clearAllMocks()

        vi.mocked(cookies).mockResolvedValue({
            get: mockCookieGet,
            getAll: vi.fn(),
            has: vi.fn(),
            set: vi.fn(),
            delete: vi.fn(),
            size: 1,
            [Symbol.iterator]: vi.fn(),
        })

        mockCookieGet.mockReturnValue({
            name: ACCESS_TOKEN_COOKIE,
            value: "mock-token",
        })

        vi.mocked(getGql).mockResolvedValue({
            request: mockRequest,
            url: "",
            requestConfig: {},
            rawRequest: vi.fn(),
            batchRequests: vi.fn(),
            setHeader: vi.fn(),
            setHeaders: vi.fn(),
            setHeaderInternal: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof getGql>>)
    })

    it("successfully updates password when valid data is provided", async () => {
        mockRequest.mockResolvedValueOnce({ success: true })

        const result = await updateSettingsPasswordAction(validData)

        expect(cookies).toHaveBeenCalledTimes(1)
        expect(mockCookieGet).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE)
        expect(getGql).toHaveBeenCalledWith("mock-token")
        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(result).toEqual({})
    })

    it("returns session expired error when client error contains unauthorized or expired message", async () => {
        const clientError = new ClientError(
            {
                status: 401,
                headers: new Headers(),
                errors: [
                    {
                        message: "Token expired",
                    },
                ],
                data: null,
                statusText: "Unauthorized",
                body: "",
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest.mockRejectedValueOnce(clientError)

        const result = await updateSettingsPasswordAction(validData)

        expect(result).toEqual({ error: "sessionExpired" })
        const t = await getTranslations("Settings.messages")
        expect(t("sessionExpired")).toBe("sessionExpired")
    })

    it("returns general password update failed error on other client or generic errors", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})

        mockRequest.mockRejectedValueOnce(new Error("Network error"))

        const result = await updateSettingsPasswordAction(validData)

        expect(result).toEqual({ error: "passwordUpdateFailed" })
        const t = await getTranslations("Settings.messages")
        expect(t("passwordUpdateFailed")).toBe("passwordUpdateFailed")

        consoleErrorSpy.mockRestore()
    })

    it("handles ClientError with no error messages", async () => {
        const clientError = new ClientError(
            {
                status: 400,
                headers: new Headers(),
                errors: [],
                data: null,
                statusText: "Bad Request",
                body: "",
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest.mockRejectedValueOnce(clientError)

        const result = await updateSettingsPasswordAction(validData)

        expect(result).toEqual({ error: "passwordUpdateFailed" })
    })

    it("returns unauthorized error when token is missing from cookies", async () => {
        mockCookieGet.mockReturnValue(undefined)

        mockRequest.mockResolvedValueOnce({ success: true })

        const result = await updateSettingsPasswordAction(validData)

        expect(getGql).toHaveBeenCalledWith("")
        expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    it("returns error with multiple error messages from ClientError", async () => {
        const clientError = new ClientError(
            {
                status: 401,
                headers: new Headers(),
                errors: [
                    { message: "Token expired" },
                    { message: "Invalid signature" },
                ],
                data: null,
                statusText: "Unauthorized",
                body: "",
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest.mockRejectedValueOnce(clientError)

        const result = await updateSettingsPasswordAction(validData)

        expect(result).toEqual({ error: "sessionExpired" })
    })
})
