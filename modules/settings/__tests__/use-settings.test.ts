import { act, renderHook } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { usePathname, useRouter } from "@/i18n/navigation"

import { updateSettingsPasswordAction } from "../api/update-password"
import { useSettings } from "../hooks/use-settings"

vi.mock("@/i18n/navigation", () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
    useLocale: vi.fn(() => "en"),
}))

vi.mock("next-themes", () => ({
    useTheme: vi.fn(),
}))

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

vi.mock("../api/update-password", () => ({
    updateSettingsPasswordAction: vi.fn(),
}))

vi.mock("@hookform/resolvers/zod", () => ({
    zodResolver: () => async (data: Record<string, unknown>) => ({
        values: data,
        errors: {},
    }),
}))

describe("useSettings", () => {
    const mockReplace = vi.fn()
    const mockSetTheme = vi.fn()

    const validFormValues = {
        theme: "Dark",
        language: "en" as const,
        password: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useRouter).mockReturnValue({
            replace: mockReplace,
            push: vi.fn(),
            refresh: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            bfcacheId: "",
        })

        vi.mocked(usePathname).mockReturnValue("/settings")
        vi.mocked(useTheme).mockReturnValue({
            theme: "dark",
            setTheme: mockSetTheme,
            themes: ["dark", "light"],
            systemTheme: "dark",
        })

        const mockT = Object.assign(
            vi.fn((key: string) => key),
            {
                rich: vi.fn((key: string) => key),
                markup: vi.fn(),
                raw: vi.fn(),
                has: vi.fn(),
            },
        )

        vi.mocked(useTranslations).mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>,
        )
    })

    it("initializes with default values and correct state", () => {
        const { result } = renderHook(() => useSettings())

        expect(result.current.locale).toBe("en")
        expect(result.current.isPending).toBe(false)
        expect(typeof result.current.register).toBe("function")
        expect(typeof result.current.handleSubmit).toBe("function")
        expect(typeof result.current.onSubmit).toBe("function")
        expect(typeof result.current.handleLanguageChange).toBe("function")
    })

    it("handles language change correctly", () => {
        const { result } = renderHook(() => useSettings())

        act(() => {
            result.current.handleLanguageChange("fr")
        })

        expect(mockReplace).toHaveBeenCalledTimes(1)
        expect(mockReplace).toHaveBeenCalledWith("/settings", { locale: "fr" })
    })

    it("handles password update successfully and shows success toast", async () => {
        vi.mocked(updateSettingsPasswordAction).mockResolvedValueOnce({})

        const { result } = renderHook(() => useSettings())

        await act(async () => {
            await result.current.onSubmit(validFormValues)
        })

        expect(updateSettingsPasswordAction).toHaveBeenCalledTimes(1)
        expect(updateSettingsPasswordAction).toHaveBeenCalledWith({
            password: validFormValues.password,
            newPassword: validFormValues.newPassword,
            confirmPassword: validFormValues.confirmPassword,
        })
        expect(toast.success).toHaveBeenCalledTimes(1)
        expect(toast.error).not.toHaveBeenCalled()
    })

    it("handles password update failure and shows error toast", async () => {
        vi.mocked(updateSettingsPasswordAction).mockResolvedValueOnce({
            error: "Session expired",
        })

        const { result } = renderHook(() => useSettings())

        await act(async () => {
            await result.current.onSubmit(validFormValues)
        })

        expect(updateSettingsPasswordAction).toHaveBeenCalledTimes(1)
        expect(toast.error).toHaveBeenCalledTimes(1)
        expect(toast.error).toHaveBeenCalledWith("error", {
            description: "Session expired",
        })
        expect(toast.success).not.toHaveBeenCalled()
    })
})
