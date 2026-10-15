import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
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
}))

vi.mock("@/i18n/navigation", () => ({
    Link: ({ href, children }: { href: string; children: ReactNode }) => (
        <a href={href}>{children}</a>
    ),
    usePathname: () => "/cv",
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

    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingCv = vi.fn()
    const mockSetDeletingCv = vi.fn()
    const mockSetActiveMenuId = vi.fn()
    const mockHandleCreate = vi.fn()
    const mockHandleUpdate = vi.fn()
    const mockHandleDelete = vi.fn()

    const defaultHookReturn: ReturnType<typeof useCvsPage> = {
        cvs: mockCvs,
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
        vi.mocked(useCvsPage).mockReturnValue(defaultHookReturn)
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

    it("links the name column to ascending sort when that column is not active", () => {
        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        const sortLink = screen.getByRole("link", { name: "name" })
        expect(sortLink).toHaveAttribute(
            "href",
            "/cv?page=1&limit=10&sortBy=name&sortOrder=asc",
        )
        expect(sortLink.parentElement).toHaveAttribute("aria-sort", "none")
    })

    it("links the name column to descending sort when it is already sorted ascending", () => {
        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search="react"
                limit={10}
                sortBy="name"
                sortOrder="asc"
            />,
        )

        const sortLink = screen.getByRole("link", { name: /^name/ })
        expect(sortLink).toHaveAttribute(
            "href",
            "/cv?page=1&limit=10&search=react&sortBy=name&sortOrder=desc",
        )
        expect(sortLink.parentElement).toHaveAttribute("aria-sort", "ascending")
    })

    it("links the name column back to ascending sort when it is already sorted descending", () => {
        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
                sortBy="name"
                sortOrder="desc"
            />,
        )

        const sortLink = screen.getByRole("link", { name: /^name/ })
        expect(sortLink).toHaveAttribute(
            "href",
            "/cv?page=1&limit=10&sortBy=name&sortOrder=asc",
        )
        expect(sortLink.parentElement).toHaveAttribute(
            "aria-sort",
            "descending",
        )
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
        })

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

    it("opens edit modal and handles edit click", async () => {
        const user = userEvent.setup()
        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            activeMenuId: "cv-1",
        })

        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        const editButton = screen.getByText("edit")
        await user.click(editButton)

        expect(mockSetActiveMenuId).toHaveBeenCalledWith(null)
        expect(mockSetEditingCv).toHaveBeenCalledWith(mockCvs[0])
    })

    it("opens delete modal and handles delete click", async () => {
        const user = userEvent.setup()
        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            activeMenuId: "cv-1",
        })

        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        const deleteButton = screen.getByText("delete")
        await user.click(deleteButton)

        expect(mockSetActiveMenuId).toHaveBeenCalledWith(null)
        expect(mockSetDeletingCv).toHaveBeenCalledWith(mockCvs[0])
    })

    it("renders empty message when no CVs are available", () => {
        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            cvs: [],
        })

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

    it("renders noResults message when cvs list is empty and search or isAdmin is true", () => {
        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            cvs: [],
        })

        render(
            <CvsPageView
                initialCvs={[]}
                isAdmin={true}
                search="react"
                limit={10}
            />,
        )

        expect(screen.getByText("noResults")).toBeInTheDocument()
    })

    it("renders create, update and delete modals when their respective states are active", () => {
        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            isCreateOpen: true,
            editingCv: mockCvs[0],
            deletingCv: mockCvs[0],
        })

        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        expect(screen.getByTestId("create-cv-modal")).toBeInTheDocument()
        expect(screen.getByTestId("update-cv-modal")).toBeInTheDocument()
        expect(screen.getByTestId("delete-cv-modal")).toBeInTheDocument()
    })

    it("renders fallback dash when cv user email is missing", () => {
        const cvWithoutUser: CvItem = {
            id: "cv-3",
            name: "No User CV",
            education: "BSUIR",
            description: "No user description",
        }

        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            cvs: [cvWithoutUser],
        })

        render(
            <CvsPageView
                initialCvs={[cvWithoutUser]}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        expect(screen.getByText("—")).toBeInTheDocument()
    })

    it("handles sort link correctly when sorted by a different field", () => {
        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
                sortBy="name"
                sortOrder="asc"
            />,
        )

        const sortLink = screen.getByRole("link", { name: "name" })
        expect(sortLink).toHaveAttribute(
            "href",
            "/cv?page=1&limit=10&sortBy=name&sortOrder=asc",
        )
        expect(sortLink.parentElement).toHaveAttribute("aria-sort", "ascending")
    })

    it("interacts with create, update and delete modals correctly", async () => {
        const handleCreate = vi.fn()
        const handleUpdate = vi.fn()
        const handleDelete = vi.fn()
        const setIsCreateOpen = vi.fn()
        const setEditingCv = vi.fn()
        const setDeletingCv = vi.fn()

        vi.mocked(useCvsPage).mockReturnValue({
            ...defaultHookReturn,
            isCreateOpen: true,
            editingCv: mockCvs[0],
            deletingCv: mockCvs[0],
            handleCreate,
            handleUpdate,
            handleDelete,
            setIsCreateOpen,
            setEditingCv,
            setDeletingCv,
        })

        render(
            <CvsPageView
                initialCvs={mockCvs}
                isAdmin={true}
                search=""
                limit={10}
            />,
        )

        expect(screen.getByTestId("create-cv-modal")).toBeInTheDocument()
        expect(screen.getByTestId("update-cv-modal")).toBeInTheDocument()
        expect(screen.getByTestId("delete-cv-modal")).toBeInTheDocument()
    })
})
