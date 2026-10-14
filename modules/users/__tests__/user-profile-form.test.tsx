import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useUserProfile } from "../hooks/use-user-profile"
import { UserProfileForm } from "../ui/user-profile-form"

vi.mock("../hooks/use-user-profile", () => ({
    useUserProfile: vi.fn(),
}))

vi.mock("../ui/user-avatar", () => ({
    UserAvatar: vi.fn(() => <div data-testid="user-avatar" />),
}))

vi.mock("../ui/user-profile-field", () => ({
    UserProfileTextField: vi.fn(
        ({
            label,
            value,
            onChange,
            disabled,
            error,
        }: {
            label: string
            value: string
            onChange: (val: string) => void
            disabled?: boolean
            error?: string | null
        }) => (
            <label>
                {label}
                <input
                    data-testid={`textfield-${label}`}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                />
                {error && <span data-testid="error">{error}</span>}
            </label>
        ),
    ),
    UserProfileSelect: vi.fn(
        ({
            label,
            value,
            onChange,
            disabled,
            options,
        }: {
            label: string
            value: string
            onChange: (val: string) => void
            disabled?: boolean
            options: Array<{ id: string; name: string }>
        }) => (
            <label>
                {label}
                <select
                    data-testid={`select-${label}`}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.name}
                        </option>
                    ))}
                </select>
            </label>
        ),
    ),
}))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, params?: Record<string, unknown>) => {
        if (params && params.date) return `Member since ${params.date}`
        return key
    },
    useLocale: () => "en",
}))

describe("UserProfileForm Component", () => {
    const mockSetFirstName = vi.fn()
    const mockSetLastName = vi.fn()
    const mockSetDepartmentId = vi.fn()
    const mockSetPositionId = vi.fn()
    const mockHandleUpdate = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault()
    })
    const mockHandleVerifyEmail = vi.fn()

    const sampleUser: React.ComponentProps<typeof UserProfileForm>["user"] = {
        id: "user-1",
        email: "john@example.com",
        is_verified: false,
        created_at: "2023-01-01T00:00:00Z",
        role: "Employee",
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: "avatar.jpg",
        },
        department: { id: "dep-1", name: "Engineering" },
        position: { id: "pos-1", name: "Developer" },
    }

    const defaultHookReturn: ReturnType<typeof useUserProfile> = {
        canEdit: true,
        canVerifyEmail: true,
        firstName: "John",
        setFirstName: mockSetFirstName,
        lastName: "Doe",
        setLastName: mockSetLastName,
        departmentId: "dep-1",
        setDepartmentId: mockSetDepartmentId,
        positionId: "pos-1",
        setPositionId: mockSetPositionId,
        avatarPreview: null,
        hasSubmitted: false,
        isSubmitting: false,
        isVerifyingEmail: false,
        avatarError: null,
        isChanged: true,
        isValid: true,
        handleUpdate: mockHandleUpdate,
        handleAvatarChange: vi.fn(),
        handleRemoveAvatar: vi.fn(),
        handleVerifyEmail: mockHandleVerifyEmail,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useUserProfile).mockReturnValue(defaultHookReturn)
    })

    it("renders user profile form correctly with data and fields", () => {
        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[{ id: "dep-1", name: "Engineering" }]}
                positions={[{ id: "pos-1", name: "Developer" }]}
            />,
        )

        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.getByText("john@example.com")).toBeInTheDocument()
        expect(screen.getByTestId("textfield-firstName")).toHaveValue("John")
        expect(screen.getByTestId("textfield-lastName")).toHaveValue("Doe")
        expect(
            screen.getByRole("button", { name: "verifyEmail" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "update" }),
        ).toBeInTheDocument()
    })

    it("triggers setFirstName when first name text field changes", async () => {
        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        const input = screen.getByTestId("textfield-firstName")
        await userEvent.clear(input)
        await userEvent.type(input, "Jane")

        expect(mockSetFirstName).toHaveBeenCalled()
    })

    it("triggers handleUpdate when form is submitted", async () => {
        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        const submitButton = screen.getByRole("button", { name: "update" })
        await userEvent.click(submitButton)

        expect(mockHandleUpdate).toHaveBeenCalledTimes(1)
    })

    it("triggers handleVerifyEmail when verify email button is clicked", async () => {
        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        const verifyButton = screen.getByRole("button", { name: "verifyEmail" })
        await userEvent.click(verifyButton)

        expect(mockHandleVerifyEmail).toHaveBeenCalledTimes(1)
    })

    it("disables editing controls and action buttons when canEdit is false", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            canEdit: false,
            canVerifyEmail: false,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="other-user"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByTestId("textfield-firstName")).toBeDisabled()
        expect(
            screen.queryByRole("button", { name: "update" }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: "verifyEmail" }),
        ).not.toBeInTheDocument()
    })
})
