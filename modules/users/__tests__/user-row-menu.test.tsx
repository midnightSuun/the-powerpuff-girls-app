import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"

import { deleteUser } from "../api/delete-user"
import { EditableUser } from "../hooks/use-update-user-dialog"
import { UserRowMenu } from "../ui/user-row-menu"

vi.mock("../api/delete-user", () => ({
    deleteUser: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => ({
    useRouter: vi.fn(),
    Link: vi.fn(
        ({ href, children }: { href: string; children: React.ReactNode }) => (
            <a href={href}>{children}</a>
        ),
    ),
}))

vi.mock("../ui/update-user-dialog", () => ({
    UpdateUserDialog: vi.fn(({ open }: { open: boolean }) =>
        open ? <div data-testid="update-user-dialog" /> : null,
    ),
}))

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: vi.fn(
        ({
            isOpen,
            onConfirm,
            onClose,
            isDeleting,
        }: {
            isOpen: boolean
            onConfirm: () => void
            onClose: () => void
            isDeleting: boolean
        }) =>
            isOpen ? (
                <div data-testid="delete-modal">
                    <button
                        data-testid="confirm-delete"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        Confirm Delete
                    </button>
                    <button data-testid="close-delete" onClick={onClose}>
                        Close
                    </button>
                </div>
            ) : null,
    ),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: vi.fn(
        ({
            children,
            onOpenChangeComplete,
        }: {
            children: React.ReactNode
            onOpenChangeComplete?: (open: boolean) => void
        }) => (
            <div data-testid="dropdown-menu">
                {children}
                <button
                    data-testid="close-dropdown"
                    onClick={() => onOpenChangeComplete?.(false)}
                />
            </div>
        ),
    ),
    DropdownMenuTrigger: vi.fn(
        ({
            children,
            "aria-label": ariaLabel,
        }: {
            children: React.ReactNode
            "aria-label": string
        }) => (
            <button aria-label={ariaLabel} data-testid="dropdown-trigger">
                {children}
            </button>
        ),
    ),
    DropdownMenuContent: vi.fn(
        ({ children }: { children: React.ReactNode }) => (
            <div data-testid="dropdown-content">{children}</div>
        ),
    ),
    DropdownMenuGroup: vi.fn(({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    )),
    DropdownMenuItem: vi.fn(
        ({
            children,
            onClick,
        }: {
            children: React.ReactNode
            onClick?: () => void
        }) => (
            <div
                role="menuitem"
                onClick={onClick}
                data-testid="dropdown-menu-item"
            >
                {children}
            </div>
        ),
    ),
}))

vi.mock("next-intl", () => ({
    useTranslations: () => {
        const fn = (key: string) => key
        fn.rich = (key: string, values?: Record<string, unknown>) =>
            `Delete user ${String(values?.name ?? "")}`
        return fn
    },
}))

describe("UserRowMenu Component", () => {
    const mockRefresh = vi.fn()
    const mockSuccessNotification = vi.fn()
    const mockErrorNotification = vi.fn()

    const sampleUser: EditableUser = {
        id: "user-1",
        email: "test@example.com",
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: null,
        },
        department: { id: "dep-1", name: "Engineering" },
        position: { id: "pos-1", name: "Developer" },
        role: "Admin" as const,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRefresh,
            push: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            replace: vi.fn(),
            bfcacheId: "mock-bfcache-id",
        } as unknown as ReturnType<typeof useRouter>)

        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccessNotification,
            error: mockErrorNotification,
            info: vi.fn(),
            warning: vi.fn(),
            loading: vi.fn(),
            dismiss: vi.fn(),
        } as unknown as ReturnType<typeof useActionNotifications>)
    })

    it("renders dropdown trigger with aria-label correctly", () => {
        render(<UserRowMenu label="Actions" user={sampleUser} />)

        const trigger = screen.getByTestId("dropdown-trigger")
        expect(trigger).toBeInTheDocument()
        expect(trigger).toHaveAttribute("aria-label", "Actions")
    })

    it("renders menu items (view, update, delete)", () => {
        render(<UserRowMenu label="Actions" user={sampleUser} />)

        expect(screen.getByText("view")).toBeInTheDocument()
        expect(screen.getByText("update")).toBeInTheDocument()
        expect(screen.getByText("delete")).toBeInTheDocument()
    })

    it("opens delete modal when delete action is triggered and confirms deletion successfully", async () => {
        vi.mocked(deleteUser).mockResolvedValueOnce({ success: true })

        render(<UserRowMenu label="Actions" user={sampleUser} />)

        const deleteMenuItem = screen.getByText("delete")
        await userEvent.click(deleteMenuItem)

        const closeDropdownBtn = screen.getByTestId("close-dropdown")
        await userEvent.click(closeDropdownBtn)

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()

        const confirmButton = screen.getByTestId("confirm-delete")
        await userEvent.click(confirmButton)

        expect(deleteUser).toHaveBeenCalledWith("user-1")
        expect(mockSuccessNotification).toHaveBeenCalledWith("deleted")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it("handles deletion failure and shows error notification", async () => {
        vi.mocked(deleteUser).mockResolvedValueOnce({
            success: false,
            error: "Failed to delete user",
        })

        render(<UserRowMenu label="Actions" user={sampleUser} />)

        const deleteMenuItem = screen.getByText("delete")
        await userEvent.click(deleteMenuItem)

        const closeDropdownBtn = screen.getByTestId("close-dropdown")
        await userEvent.click(closeDropdownBtn)

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()

        const confirmButton = screen.getByTestId("confirm-delete")
        await userEvent.click(confirmButton)

        expect(deleteUser).toHaveBeenCalledWith("user-1")
        expect(mockErrorNotification).toHaveBeenCalledWith(
            "Failed to delete user",
        )
        expect(mockRefresh).not.toHaveBeenCalled()
    })
})
