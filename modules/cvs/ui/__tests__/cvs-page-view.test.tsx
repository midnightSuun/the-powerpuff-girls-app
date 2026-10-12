import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCvsPage } from "../../hooks/use-cvs-page"
import type { CvItem } from "../../types"
import { CvsPageView } from "../cvs-page-view"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => "",
}))

vi.mock("../../hooks/use-cvs-page", () => ({
    useCvsPage: vi.fn(),
}))

vi.mock("@/components/search-input", () => ({
    SearchInput: ({ search }: { search: string }) => (
        <div data-testid="search-input">Search: {search}</div>
    ),
}))

vi.mock("../components/add-cv-button", () => ({
    CreateCvTriggerButton: ({ onClick }: { onClick: () => void }) => (
        <button type="button" onClick={onClick} data-testid="create-cv-trigger">
            Create CV
        </button>
    ),
}))

vi.mock("../components/create-cv-modal", () => ({
    CreateCvModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="create-cv-modal" /> : null,
}))

vi.mock("../components/update-cv-modal", () => ({
    UpdateCvModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="update-cv-modal" /> : null,
}))

vi.mock("../components/delete-cv-modal", () => ({
    DeleteCvModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="delete-cv-modal" /> : null,
}))

describe("CvsPageView", () => {
    const mockCvs: CvItem[] = [
        {
            id: "cv-1",
            name: "React Developer CV",
            education: "BSUIR",
            description: "Frontend expert",
            user: { email: "user1@test.com" },
        },
        {
            id: "cv-2",
            name: "Node Developer CV",
            education: "BNTU",
            description: "Backend expert",
            user: { email: "user2@test.com" },
        },
    ]

    const mockToggleSort = vi.fn()
    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingCv = vi.fn()
    const mockSetDeletingCv = vi.fn()
    const mockSetActiveMenuId = vi.fn()
    const mockHandleCreate = vi.fn()
    const mockHandleUpdate = vi.fn()
    const mockHandleDelete = vi.fn()

    const defaultHookReturn = {
        sortedCvs: mockCvs,
        toggleSort: mockToggleSort,
        isCreateOpen: false,
        setIsCreateOpen: mockSetIsCreateOpen,
        editingCv: null,
        setEditingCv: mockSetEditingCv,
        deletingCv: null,
        setDeletingCv: mockSetDeletingCv,
        activeMenuId: null,
        setActiveMenuId: mockSetActiveMenuId,
        isSubmitting: false,
        error: null,
        handleCreate: mockHandleCreate,
        handleUpdate: mockHandleUpdate,
        handleDelete: mockHandleDelete,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useCvsPage).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<typeof useCvsPage>,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders the list of CVs and search component correctly", () => {
        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        expect(screen.getByTestId("search-input")).toBeInTheDocument()
        expect(screen.getByText("React Developer CV")).toBeInTheDocument()
        expect(screen.getByText("Node Developer CV")).toBeInTheDocument()
        expect(screen.getByText("user1@test.com")).toBeInTheDocument()
    })

    it("triggers toggleSort when name column header is clicked", async () => {
        const user = userEvent.setup()
        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        const sortHeader = screen.getByText("name")
        await user.click(sortHeader)

        expect(mockToggleSort).toHaveBeenCalledTimes(1)
    })

    it("triggers setIsCreateOpen when create trigger button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        const createButton = screen.getByTestId("create-cv-trigger")
        await user.click(createButton)

        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(true)
    })

    it("opens action menu and handles view navigation", async () => {
        const user = userEvent.setup()
        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            activeMenuId: "cv-1",
        } as unknown as ReturnType<typeof useCvsPage>)

        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        const viewButton = screen.getByText("view")
        await user.click(viewButton)

        expect(mockSetActiveMenuId).toHaveBeenCalledWith(null)
        expect(mockPush).toHaveBeenCalledWith("/cv/cv-1")
    })

    it("renders empty message when no CVs are available", () => {
        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            sortedCvs: [],
        } as unknown as ReturnType<typeof useCvsPage>)

        render(
            <CvsPageView
                initialCvs={[]}
                isAdmin={false}
                search=""
                limit={10}
            />,
        )

        expect(screen.getByText("empty")).toBeInTheDocument()
    })
})
