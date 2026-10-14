import { fireEvent, render, screen } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useSettings } from "../hooks/use-settings"
import { SettingsPage } from "../ui/settings-page"

vi.mock("../hooks/use-settings", () => ({
    useSettings: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

vi.mock("@/components/password-field", () => ({
    PasswordField: ({
        label,
        error,
        ...props
    }: {
        label: string
        error?: string
        [key: string]: unknown
    }) => (
        <div>
            <label>{label}</label>
            <input data-testid={label} {...props} />
            {error && <span data-testid={`${label}-error`}>{error}</span>}
        </div>
    ),
}))

vi.mock("@/components/ui/select", () => ({
    Select: ({
        children,
        onValueChange,
        value,
    }: {
        children: React.ReactNode
        onValueChange: (value: string) => void
        value: string
    }) => (
        <div data-testid="select-container">
            <select
                role="combobox"
                data-testid="select"
                onChange={(e) => onValueChange(e.target.value)}
                value={value}
            >
                {children}
            </select>
        </div>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => (
        <span>{placeholder}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    SelectItem: ({
        children,
        value,
    }: {
        children: React.ReactNode
        value: string
    }) => <option value={value}>{children}</option>,
}))

describe("SettingsPage", () => {
    const mockSetTheme = vi.fn()
    const mockHandleLanguageChange = vi.fn()

    const mockHandleSubmit = vi.fn(
        (cb) => (e?: { preventDefault?: () => void }) => {
            if (e?.preventDefault) {
                e.preventDefault()
            }
            cb({
                password: "OldPassword123!",
                newPassword: "NewPassword123!",
                confirmPassword: "NewPassword123!",
            })
        },
    ) as unknown as ReturnType<typeof useSettings>["handleSubmit"]

    const mockOnSubmit = vi.fn()
    const mockRegister = vi.fn((name: string) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
    })) as unknown as ReturnType<typeof useSettings>["register"]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useTranslations).mockReturnValue(
            ((key: string) => key) as unknown as ReturnType<
                typeof useTranslations
            >,
        )

        vi.mocked(useSettings).mockReturnValue({
            locale: "en",
            isPending: false,
            register: mockRegister,
            handleSubmit: mockHandleSubmit,
            onSubmit: mockOnSubmit,
            errors: {},
            isValid: true,
            setTheme: mockSetTheme,
            handleLanguageChange: mockHandleLanguageChange,
            watch: vi.fn((_fieldName: string) => {
                // Возвращаем пустую строку для любого поля
                return ""
            }) as unknown as ReturnType<typeof useSettings>["watch"],
        })
    })

    it("renders settings page form elements correctly", () => {
        render(<SettingsPage />)

        expect(screen.getByText("theme.label")).toBeInTheDocument()
        expect(screen.getAllByText("language.label")).toHaveLength(2) // One in floating label, one in placeholder
        expect(screen.getByText("passwordSection.title")).toBeInTheDocument()
        expect(
            screen.getAllByRole("button", {
                name: /passwordSection\.submitButton/i,
            })[0],
        ).toBeInTheDocument()
    })

    it("handles theme selection change correctly", () => {
        render(<SettingsPage />)

        const themeSelects = screen.getAllByTestId("select")
        const themeSelect = themeSelects[0]
        fireEvent.change(themeSelect, { target: { value: "Light" } })

        expect(mockSetTheme).toHaveBeenCalledWith("light")
    })

    it("handles language selection change correctly", () => {
        render(<SettingsPage />)

        const selects = screen.getAllByTestId("select")
        const languageSelect = selects[1]

        fireEvent.change(languageSelect, { target: { value: "fr" } })

        expect(mockHandleLanguageChange).toHaveBeenCalledWith("fr")
    })

    it("submits the password form successfully", () => {
        render(<SettingsPage />)

        const submitButton = screen.getAllByRole("button", {
            name: /passwordSection\.submitButton/i,
        })[0]
        fireEvent.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit).toHaveBeenCalledWith({
            password: "OldPassword123!",
            newPassword: "NewPassword123!",
            confirmPassword: "NewPassword123!",
        })
    })

    it("disables submit button when form is invalid or pending", () => {
        vi.mocked(useSettings).mockReturnValueOnce({
            locale: "en",
            isPending: true,
            register: mockRegister,
            handleSubmit: mockHandleSubmit,
            onSubmit: mockOnSubmit,
            errors: {},
            isValid: false,
            setTheme: mockSetTheme,
            handleLanguageChange: mockHandleLanguageChange,
            watch: vi.fn((_fieldName: string) => {
                // Возвращаем пустую строку для любого поля
                return ""
            }) as unknown as ReturnType<typeof useSettings>["watch"],
        })

        render(<SettingsPage />)

        const submitButton = screen.getAllByRole("button", {
            name: /passwordSection\.submittingButton/i,
        })[0]
        expect(submitButton).toBeDisabled()
    })
})
