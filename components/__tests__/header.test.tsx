import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Header } from "../header"

const mockGetCurrentSession = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

const mockGetHeaderCopy = vi.fn()
vi.mock("@/components/header-view/get-header-copy", () => ({
    getHeaderCopy: () => mockGetHeaderCopy(),
}))

const mockGetUser = vi.fn()
vi.mock("@/modules/users/api/get-user", () => ({
    getUser: (id: string) => mockGetUser(id),
}))

const mockGetCvById = vi.fn()
vi.mock("@/modules/cvs/api/get-cv", () => ({
    getCvById: (id: string) => mockGetCvById(id),
}))

type HeaderPageProps = {
    type: string
    path: string
    showSearch?: boolean
    tabs?: Array<{ path: string; showSearch?: boolean }>
}

type HeaderViewProps = {
    isAdmin: boolean
    viewerId: string | null
    pages: HeaderPageProps[]
    loadSecondBreadcrumb: (path: string, id: string) => Promise<string | null>
}

let capturedHeaderViewProps: HeaderViewProps | null = null

vi.mock("@/components/header-view", () => ({
    HeaderView: (props: HeaderViewProps) => {
        capturedHeaderViewProps = props
        return <div data-testid="header-view" />
    },
}))

describe("Header (Server Component)", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        capturedHeaderViewProps = null

        mockGetHeaderCopy.mockResolvedValue({
            copy: { users: "Users", cvs: "CVs" },
            breadcrumbLabel: "Details",
        })
    })

    it("renders HeaderView with correct admin status and pages when user is Admin", async () => {
        mockGetCurrentSession.mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
        })

        render(await Header())

        expect(screen.getByTestId("header-view")).toBeInTheDocument()
        expect(capturedHeaderViewProps?.isAdmin).toBe(true)
        expect(capturedHeaderViewProps?.viewerId).toBe("admin-1")
        expect(capturedHeaderViewProps?.pages).toBeInstanceOf(Array)
        expect(capturedHeaderViewProps?.pages.length).toBeGreaterThan(0)
    })

    it("renders HeaderView with isAdmin=false when user is regular or session is missing", async () => {
        mockGetCurrentSession.mockResolvedValueOnce(null)

        render(await Header())

        expect(capturedHeaderViewProps?.isAdmin).toBe(false)
        expect(capturedHeaderViewProps?.viewerId).toBeNull()
    })

    it("shows header search on skills and languages only for admins", async () => {
        mockGetCurrentSession.mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
        })

        render(await Header())

        const pages = capturedHeaderViewProps?.pages ?? []
        expect(pages.find((page) => page.path === "/skills")?.showSearch).toBe(
            true,
        )
        expect(
            pages.find((page) => page.path === "/languages")?.showSearch,
        ).toBe(true)

        const userTabs = pages.find((page) => page.path === "/users/{userId}")
        expect(
            userTabs?.tabs?.find((tab) => tab.path === "/skills")?.showSearch,
        ).toBe(false)
        expect(
            userTabs?.tabs?.find((tab) => tab.path === "/languages")
                ?.showSearch,
        ).toBe(false)
    })

    it("hides header search on skills and languages for a regular user", async () => {
        mockGetCurrentSession.mockResolvedValueOnce({
            userId: "user-1",
            role: "Employee",
        })

        render(await Header())

        const pages = capturedHeaderViewProps?.pages ?? []
        expect(pages.find((page) => page.path === "/skills")?.showSearch).toBe(
            false,
        )
        expect(
            pages.find((page) => page.path === "/languages")?.showSearch,
        ).toBe(false)
    })

    describe("loadSecondBreadcrumb server action", () => {
        it("loads and formats user second breadcrumb correctly (full name)", async () => {
            mockGetCurrentSession.mockResolvedValueOnce({
                userId: "u1",
                role: "User",
            })
            mockGetUser.mockResolvedValueOnce({
                email: "john@example.com",
                profile: { first_name: "  John  ", last_name: "  Doe  " },
            })

            render(await Header())

            const loadFn = capturedHeaderViewProps?.loadSecondBreadcrumb
            const result = await loadFn?.("/users/{userId}", "user-123")

            expect(mockGetUser).toHaveBeenCalledWith("user-123")
            expect(result).toBe("John Doe")
        })

        it("falls back to user email if first or last name is missing", async () => {
            mockGetCurrentSession.mockResolvedValueOnce({
                userId: "u1",
                role: "User",
            })
            mockGetUser.mockResolvedValueOnce({
                email: "john@example.com",
                profile: { first_name: "", last_name: "" },
            })

            render(await Header())

            const loadFn = capturedHeaderViewProps?.loadSecondBreadcrumb
            const result = await loadFn?.("/users/{userId}", "user-123")

            expect(result).toBe("john@example.com")
        })

        it("loads and formats CV second breadcrumb correctly", async () => {
            mockGetCurrentSession.mockResolvedValueOnce({
                userId: "u1",
                role: "User",
            })
            mockGetCvById.mockResolvedValueOnce({
                data: { name: "Senior Frontend CV" },
            })

            render(await Header())

            const loadFn = capturedHeaderViewProps?.loadSecondBreadcrumb
            const result = await loadFn?.("/cv/{id}", "cv-456")

            expect(mockGetCvById).toHaveBeenCalledWith("cv-456")
            expect(result).toBe("Senior Frontend CV")
        })

        it("returns null when page path is not found or error is thrown", async () => {
            mockGetCurrentSession.mockResolvedValueOnce({
                userId: "u1",
                role: "User",
            })
            mockGetUser.mockRejectedValueOnce(new Error("Network error"))

            render(await Header())

            const loadFn = capturedHeaderViewProps?.loadSecondBreadcrumb

            const invalidPathResult = await loadFn?.("/unknown-path", "123")
            expect(invalidPathResult).toBeNull()

            const errorResult = await loadFn?.("/users/{userId}", "user-123")
            expect(errorResult).toBeNull()
        })
    })
})
