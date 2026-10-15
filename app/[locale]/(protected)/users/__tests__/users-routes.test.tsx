import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { prerender } from "react-dom/static"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { redirect } from "@/i18n/navigation"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getUserCvs } from "@/modules/cvs/api/cvs"
import {
    getAvailableLanguages,
    getUserLanguages,
} from "@/modules/languages/api/languages"
import { getUserSkills } from "@/modules/skills/api/skills"

import UserCvPage from "../[userId]/cv/page"
import UserLanguagesPage from "../[userId]/languages/page"
import UserDetailRoute from "../[userId]/page"
import UserProfilePage from "../[userId]/profile/page"
import UserSkillsPage from "../[userId]/skills/page"
import UsersRoute from "../page"

vi.mock("@/i18n/navigation", () => ({
    redirect: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/modules/users", () => ({
    CreateUserDialog: () => <div data-testid="create-user-dialog" />,
    UsersPage: ({
        limit,
        page,
        search,
        sortBy,
        sortOrder,
    }: {
        limit: number
        page: number
        search: string
        sortBy?: string
        sortOrder: string
    }) => (
        <div
            data-testid="users-page"
            data-limit={limit}
            data-page={page}
            data-search={search}
            data-sort-by={sortBy ?? ""}
            data-sort-order={sortOrder}
        />
    ),
    UsersTableFrame: ({ children }: { children: ReactNode }) => (
        <div data-testid="users-table-frame">{children}</div>
    ),
    UserPage: ({ userId }: { userId: string }) => (
        <div data-testid="user-page" data-user-id={userId} />
    ),
    UserProfileSkeleton: () => <div data-testid="user-profile-skeleton" />,
}))

vi.mock("@/components/pagination", () => ({
    PaginationComponent: ({
        totalPages,
        page,
        limit,
        search,
        path,
        sortBy,
        sortOrder,
    }: {
        totalPages: number
        page: number
        limit: number
        search: string
        path: string
        sortBy?: string
        sortOrder: string
    }) => (
        <div
            data-testid="pagination"
            data-total-pages={totalPages}
            data-page={page}
            data-limit={limit}
            data-search={search}
            data-path={path}
            data-sort-by={sortBy ?? ""}
            data-sort-order={sortOrder}
        />
    ),
}))

vi.mock("@/modules/cvs/api/cvs", () => ({
    getUserCvs: vi.fn(),
}))

vi.mock("@/modules/cvs/ui/cvs-page-view", () => ({
    CvsPageView: ({
        initialCvs,
        isAdmin,
        targetUserId,
    }: {
        initialCvs: Array<{ education: string }>
        isAdmin: boolean
        targetUserId?: string
    }) => (
        <div
            data-testid="cvs-page"
            data-is-admin={String(isAdmin)}
            data-count={initialCvs.length}
            data-education={initialCvs.map((cv) => cv.education).join("|")}
            data-target-user-id={targetUserId}
        />
    ),
}))

vi.mock("@/modules/languages/api/languages", () => ({
    getUserLanguages: vi.fn(),
    getAvailableLanguages: vi.fn(),
}))

vi.mock("@/modules/languages/ui/languages-page", () => ({
    LanguagesPage: ({
        userId,
        canManageLanguages,
        initialUserLanguages,
        allSystemLanguages,
    }: {
        userId: string
        canManageLanguages: boolean
        initialUserLanguages: unknown[]
        allSystemLanguages: unknown[]
    }) => (
        <div
            data-testid="languages-page"
            data-user-id={userId}
            data-can-manage={String(canManageLanguages)}
            data-language-count={initialUserLanguages.length}
            data-system-count={allSystemLanguages.length}
        />
    ),
}))

vi.mock("@/modules/skills/api/skills", () => ({
    getUserSkills: vi.fn(),
}))

vi.mock("@/modules/skills/ui/skills", () => ({
    Skills: ({
        canManageSkills,
        compact,
        userSkills,
    }: {
        canManageSkills?: boolean
        compact?: boolean
        userSkills: { cvId: string }
    }) => (
        <div
            data-testid="skills"
            data-can-manage={String(canManageSkills)}
            data-compact={String(compact)}
            data-cv-id={userSkills.cvId}
        />
    ),
}))

const mount = async (node: ReactNode) => {
    const { prelude } = await prerender(node)
    const html = await new Response(prelude).text()

    return render(<div dangerouslySetInnerHTML={{ __html: html }} />)
}

const session = (userId: string, role: "Admin" | "Employee" | null) =>
    ({
        userId,
        role,
    }) satisfies NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>

describe("[locale]/users routes", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("users page", () => {
        it("shows the create action and parsed query for an admin", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("admin-1", "Admin"),
            )

            await mount(
                await UsersRoute({
                    searchParams: Promise.resolve({
                        limit: "25",
                        page: "2",
                        search: "ada",
                        sortBy: "email",
                        sortOrder: "desc",
                    }),
                }),
            )

            expect(screen.getByTestId("create-user-dialog")).toBeInTheDocument()
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-limit",
                "25",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-page",
                "2",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-search",
                "ada",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-sort-by",
                "email",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-sort-order",
                "desc",
            )
        })

        it("hides the create action for an employee", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("user-1", "Employee"),
            )

            await mount(
                await UsersRoute({
                    searchParams: Promise.resolve({}),
                }),
            )

            expect(
                screen.queryByTestId("create-user-dialog"),
            ).not.toBeInTheDocument()
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-limit",
                "10",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-page",
                "1",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-sort-by",
                "",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-sort-order",
                "asc",
            )
        })

        it("falls back when the sort query is invalid", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(null)

            await mount(
                await UsersRoute({
                    searchParams: Promise.resolve({
                        limit: "0",
                        page: "-1",
                        sortBy: "unknown",
                        sortOrder: "sideways",
                    }),
                }),
            )

            expect(
                screen.queryByTestId("create-user-dialog"),
            ).not.toBeInTheDocument()
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-limit",
                "10",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-page",
                "1",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-sort-by",
                "",
            )
            expect(screen.getByTestId("users-page")).toHaveAttribute(
                "data-sort-order",
                "asc",
            )
        })
    })

    describe("user detail route", () => {
        it("redirects to the profile tab", async () => {
            await UserDetailRoute({
                params: Promise.resolve({
                    locale: "ru",
                    userId: "user-1",
                }),
            })

            expect(redirect).toHaveBeenCalledWith({
                href: "/users/user-1/profile",
                locale: "ru",
            })
        })
    })

    describe("user profile route", () => {
        it("renders the profile for the requested user", async () => {
            await mount(
                <UserProfilePage
                    params={Promise.resolve({
                        locale: "en",
                        userId: "user-9",
                    })}
                />,
            )

            expect(screen.getByTestId("user-page")).toHaveAttribute(
                "data-user-id",
                "user-9",
            )
            expect(
                screen.queryByTestId("user-profile-skeleton"),
            ).not.toBeInTheDocument()
        })
    })

    describe("user cvs route", () => {
        const params = Promise.resolve({ locale: "en", userId: "user-1" })

        it("redirects to login when the session is missing", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(null)

            await mount(
                <UserCvPage
                    params={params}
                    searchParams={Promise.resolve({})}
                />,
            )

            expect(redirect).toHaveBeenCalledWith({
                href: "/auth/login",
                locale: "en",
            })
            expect(getUserCvs).not.toHaveBeenCalled()
            expect(screen.queryByTestId("cvs-page")).not.toBeInTheDocument()
        })

        it("redirects another employee to the profile tab", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("user-2", "Employee"),
            )

            await mount(
                <UserCvPage
                    params={params}
                    searchParams={Promise.resolve({})}
                />,
            )

            expect(redirect).toHaveBeenCalledWith({
                href: "/users/user-1/profile",
                locale: "en",
            })
            expect(getUserCvs).not.toHaveBeenCalled()
            expect(screen.queryByTestId("cvs-page")).not.toBeInTheDocument()
        })

        it("renders an admin view with normalized cv data and a default path", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("admin-1", "Admin"),
            )
            vi.mocked(getUserCvs).mockResolvedValue({
                total: 1,
                page: 2,
                limit: 20,
                total_pages: 4,
                items: [
                    {
                        id: "cv-1",
                        name: "Main",
                        education: null,
                        description: "Profile",
                        user: { email: "ada@example.com" },
                    },
                ],
            })

            await mount(
                <UserCvPage
                    params={params}
                    searchParams={Promise.resolve({
                        page: "2",
                        limit: "20",
                        search: "main",
                        sortBy: "name",
                        sortOrder: "desc",
                    })}
                />,
            )

            expect(getUserCvs).toHaveBeenCalledWith("user-1", {
                page: 2,
                limit: 20,
                search: "main",
                sort_by: "name",
                sort_order: "desc",
            })
            expect(screen.getByTestId("cvs-page")).toHaveAttribute(
                "data-is-admin",
                "true",
            )
            expect(screen.getByTestId("cvs-page")).toHaveAttribute(
                "data-education",
                "",
            )
            expect(screen.getByTestId("cvs-page")).toHaveAttribute(
                "data-target-user-id",
                "user-1",
            )
            expect(screen.getByTestId("pagination")).toHaveAttribute(
                "data-total-pages",
                "4",
            )
            expect(screen.getByTestId("pagination")).toHaveAttribute(
                "data-path",
                "users/user-1/cv",
            )
            expect(screen.getByTestId("pagination")).toHaveAttribute(
                "data-sort-order",
                "desc",
            )
        })

        it("lets the profile owner open cvs without admin controls", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("user-1", "Employee"),
            )
            vi.mocked(getUserCvs).mockResolvedValue({
                total: 0,
                page: 1,
                limit: 10,
                total_pages: 0,
                items: [],
            })

            await mount(
                <UserCvPage
                    params={Promise.resolve({ locale: "ru", userId: "user-1" })}
                    searchParams={Promise.resolve({
                        page: "0",
                        limit: "1.5",
                    })}
                />,
            )

            expect(getUserCvs).toHaveBeenCalledWith("user-1", {
                page: 1,
                limit: 10,
                search: "",
                sort_by: undefined,
                sort_order: undefined,
            })
            expect(screen.getByTestId("cvs-page")).toHaveAttribute(
                "data-is-admin",
                "false",
            )
            expect(screen.getByTestId("cvs-page")).toHaveAttribute(
                "data-count",
                "0",
            )
            expect(screen.getByTestId("pagination")).toHaveAttribute(
                "data-path",
                "ru/users/user-1/cv",
            )
            expect(screen.getByTestId("pagination")).toHaveAttribute(
                "data-total-pages",
                "0",
            )
        })
    })

    describe("user languages route", () => {
        const languages = [{ name: "English", proficiency: "C1" as const }]
        const systemLanguages = [{ id: "en", name: "English", iso2: "en" }]

        beforeEach(() => {
            vi.mocked(getUserLanguages).mockResolvedValue({ languages })
            vi.mocked(getAvailableLanguages).mockResolvedValue(systemLanguages)
        })

        const renderLanguages = (userId = "user-1") =>
            mount(
                <UserLanguagesPage
                    params={Promise.resolve({ locale: "en", userId })}
                />,
            )

        it("allows an admin to manage another user's languages", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("admin-1", "Admin"),
            )

            await renderLanguages()

            expect(getUserLanguages).toHaveBeenCalledWith("user-1")
            expect(screen.getByTestId("languages-page")).toHaveAttribute(
                "data-can-manage",
                "true",
            )
            expect(screen.getByTestId("languages-page")).toHaveAttribute(
                "data-language-count",
                "1",
            )
            expect(screen.getByTestId("languages-page")).toHaveAttribute(
                "data-system-count",
                "1",
            )
        })

        it("allows the profile owner to manage languages", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("user-1", "Employee"),
            )

            await renderLanguages()

            expect(screen.getByTestId("languages-page")).toHaveAttribute(
                "data-can-manage",
                "true",
            )
        })

        it("keeps languages read-only for someone else", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("user-2", "Employee"),
            )

            await renderLanguages()

            expect(screen.getByTestId("languages-page")).toHaveAttribute(
                "data-can-manage",
                "false",
            )
        })

        it("keeps languages read-only without a session", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(null)

            await renderLanguages()

            expect(screen.getByTestId("languages-page")).toHaveAttribute(
                "data-can-manage",
                "false",
            )
        })
    })

    describe("user skills route", () => {
        beforeEach(() => {
            vi.mocked(getUserSkills).mockResolvedValue({
                cvId: "cv-1",
                skills: [],
            })
        })

        const renderSkills = (userId = "user-1") =>
            mount(
                <UserSkillsPage
                    params={Promise.resolve({ locale: "en", userId })}
                />,
            )

        it("allows an admin to manage skills", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("admin-1", "Admin"),
            )

            await renderSkills()

            expect(getUserSkills).toHaveBeenCalledWith("user-1")
            expect(screen.getByTestId("skills")).toHaveAttribute(
                "data-can-manage",
                "true",
            )
            expect(screen.getByTestId("skills")).toHaveAttribute(
                "data-compact",
                "false",
            )
            expect(screen.getByTestId("skills")).toHaveAttribute(
                "data-cv-id",
                "cv-1",
            )
        })

        it("allows the profile owner to manage skills", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("user-1", "Employee"),
            )

            await renderSkills()

            expect(screen.getByTestId("skills")).toHaveAttribute(
                "data-can-manage",
                "true",
            )
        })

        it("keeps skills read-only for someone else", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(
                session("user-2", "Employee"),
            )

            await renderSkills()

            expect(screen.getByTestId("skills")).toHaveAttribute(
                "data-can-manage",
                "false",
            )
        })

        it("keeps skills read-only without a session", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue(null)

            await renderSkills()

            expect(screen.getByTestId("skills")).toHaveAttribute(
                "data-can-manage",
                "false",
            )
        })
    })
})
