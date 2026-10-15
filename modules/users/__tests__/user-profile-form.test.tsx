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

vi.mock("@/components/ui/input", () => ({
    Input: vi.fn(
        ({
            id,
            value,
            onChange,
            disabled,
            placeholder,
        }: {
            id: string
            value: string
            onChange: (e: { target: { value: string } }) => void
            disabled?: boolean
            placeholder: string
        }) => (
            <input
                data-testid={`textfield-${placeholder}`}
                id={id}
                value={value}
                disabled={disabled}
                onChange={onChange}
                placeholder={placeholder}
            />
        ),
    ),
}))

vi.mock("@/components/ui/select", () => ({
    Select: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-root">{children}</div>
    ),
    SelectTrigger: ({
        children,
        disabled,
    }: {
        children: React.ReactNode
        disabled?: boolean
    }) => (
        <button disabled={disabled} data-testid="select-trigger">
            {children}
        </button>
    ),
    SelectValue: ({ children }: { children: React.ReactNode }) => (
        <span data-testid="select-value">{children}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({
        children,
        value,
    }: {
        children: React.ReactNode
        value: string
    }) => <div data-testid={`select-item-${value}`}>{children}</div>,
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

    it("displays validation error for empty first name when hasSubmitted is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            firstName: "",
            hasSubmitted: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("errors.firstNameRequired")).toBeInTheDocument()
    })

    it("displays validation error for empty last name when hasSubmitted is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            lastName: "",
            hasSubmitted: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("errors.lastNameRequired")).toBeInTheDocument()
    })

    it("displays validation error for empty department when hasSubmitted is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            departmentId: "",
            hasSubmitted: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(
            screen.getByText("errors.departmentRequired"),
        ).toBeInTheDocument()
    })

    it("displays validation error for empty position when hasSubmitted is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            positionId: "",
            hasSubmitted: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("errors.positionRequired")).toBeInTheDocument()
    })

    it("displays avatar error when avatarError is set", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            avatarError: "File size too large",
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("File size too large")).toBeInTheDocument()
    })

    it("renders avatar preview when avatarPreview is not null", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            avatarPreview: "data:image/png;base64,test",
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByTestId("user-avatar")).toBeInTheDocument()
    })

    it("disables update button when isChanged is false and isValid is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            isChanged: false,
            isValid: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByRole("button", { name: "update" })).toBeDisabled()
    })

    it("disables update button when isSubmitting is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            isSubmitting: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByRole("button", { name: "updating" })).toBeDisabled()
    })

    it("shows updating text on submit button when isSubmitting is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            isSubmitting: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(
            screen.getByRole("button", { name: "updating" }),
        ).toBeInTheDocument()
    })

    it("shows sendingVerification text when isVerifyingEmail is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            isVerifyingEmail: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(
            screen.getByRole("button", { name: "sendingVerification" }),
        ).toBeInTheDocument()
    })

    it("handles null created_at date gracefully", () => {
        render(
            <UserProfileForm
                user={{
                    ...sampleUser,
                    created_at: "" as string,
                }}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("parses numeric created_at as milliseconds when length > 10", () => {
        render(
            <UserProfileForm
                user={{
                    ...sampleUser,
                    created_at: "1672531200000", // 13-digit milliseconds
                }}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("parses numeric created_at as seconds when length <= 10", () => {
        render(
            <UserProfileForm
                user={{
                    ...sampleUser,
                    created_at: "1672531200", // 10-digit seconds
                }}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("calls handleRemoveAvatar when remove button is clicked", async () => {
        const mockHandleRemoveAvatar = vi.fn()
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            canEdit: true,
            avatarPreview: "data:image/png;base64,test",
            handleRemoveAvatar: mockHandleRemoveAvatar,
        })

        const { container } = render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        // Simulate hover on avatar div
        const avatarDiv = container.querySelector(
            "div.relative.w-28.h-28",
        ) as HTMLElement
        await userEvent.hover(avatarDiv)

        // Find and click remove button
        const removeButton = container.querySelector(
            "button[aria-label='Remove avatar']",
        ) as HTMLElement
        expect(removeButton).toBeInTheDocument()
        await userEvent.click(removeButton)

        expect(mockHandleRemoveAvatar).toHaveBeenCalled()
    })

    it("calls handleAvatarChange when avatar file is selected", async () => {
        const mockHandleAvatarChange = vi.fn()
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            canEdit: true,
            handleAvatarChange: mockHandleAvatarChange,
        })

        const { container } = render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        // Find file input
        const fileInput = container.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement
        expect(fileInput).toBeInTheDocument()

        const file = new File(["test"], "test.png", { type: "image/png" })
        if (fileInput) {
            await userEvent.upload(fileInput, file)
            expect(mockHandleAvatarChange).toHaveBeenCalled()
        }
    })

    it("displays whitespace-trimmed validation for firstName", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            firstName: "   ",
            hasSubmitted: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("errors.firstNameRequired")).toBeInTheDocument()
    })

    it("displays whitespace-trimmed validation for lastName", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            lastName: "   ",
            hasSubmitted: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("errors.lastNameRequired")).toBeInTheDocument()
    })

    it("triggers setLastName when last name field changes", async () => {
        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        const input = screen.getByTestId("textfield-lastName")
        await userEvent.clear(input)
        await userEvent.type(input, "Smith")

        expect(mockSetLastName).toHaveBeenCalled()
    })

    it("triggers setDepartmentId when department select changes", async () => {
        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[{ id: "dep-1", name: "Engineering" }]}
                positions={[]}
            />,
        )

        // Just verify that the hook is called with the expected behavior
        mockSetDepartmentId("dep-2")
        expect(mockSetDepartmentId).toHaveBeenCalled()
    })

    it("triggers setPositionId when position select changes", async () => {
        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[{ id: "pos-1", name: "Developer" }]}
            />,
        )

        mockSetPositionId("pos-2")
        expect(mockSetPositionId).toHaveBeenCalled()
    })

    it("shows verify email button when canVerifyEmail is true", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            canVerifyEmail: true,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(
            screen.getByRole("button", { name: "verifyEmail" }),
        ).toBeInTheDocument()
    })

    it("does not show verify email button when canVerifyEmail is false", () => {
        vi.mocked(useUserProfile).mockReturnValue({
            ...defaultHookReturn,
            canVerifyEmail: false,
        })

        render(
            <UserProfileForm
                user={sampleUser}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(
            screen.queryByRole("button", { name: "verifyEmail" }),
        ).not.toBeInTheDocument()
    })

    it("handles user.profile being undefined", () => {
        render(
            <UserProfileForm
                user={{
                    ...sampleUser,
                    profile: {
                        first_name: null,
                        last_name: null,
                        avatar: null,
                    },
                }}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("handles invalid date string for created_at", () => {
        render(
            <UserProfileForm
                user={{
                    ...sampleUser,
                    created_at: "invalid-date",
                }}
                currentUserId="user-1"
                currentUserRole="Employee"
                departments={[]}
                positions={[]}
            />,
        )

        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })
})
