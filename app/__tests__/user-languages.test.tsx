import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { prerender } from "react-dom/static"
import { beforeEach, describe, expect, it, vi } from "vitest"

import UserLanguagesTab from "../[locale]/(protected)/users/[userId]/languages/page"

const mockGetCurrentSession = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

const mockGetUserLanguages = vi.fn()
const mockGetAvailableLanguages = vi.fn()
vi.mock("@/modules/languages/api/languages", () => ({
    getUserLanguages: (userId: string) => mockGetUserLanguages(userId),
    getAvailableLanguages: () => mockGetAvailableLanguages(),
}))

vi.mock("@/modules/languages/ui/languages-page", () => ({
    LanguagesPage: ({
        canManageLanguages,
        initialUserLanguages,
    }: {
        canManageLanguages: boolean
        initialUserLanguages: unknown[]
    }) => (
        <div data-testid="languages-page">
            <span data-testid="can-manage">{String(canManageLanguages)}</span>
            <span data-testid="languages-count">
                {initialUserLanguages.length}
            </span>
        </div>
    ),
}))

vi.mock("@/components/progress-list-skeleton", () => ({
    ProgressListSkeleton: () => (
        <div data-testid="progress-list-skeleton">Loading...</div>
    ),
}))

const mount = async (node: ReactNode) => {
    const { prelude } = await prerender(node)
    const html = await new Response(prelude).text()

    return render(<div dangerouslySetInnerHTML={{ __html: html }} />)
}

describe("UserLanguagesTab Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders LanguagesPage with canManageLanguages = true when user is Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
        })
        mockGetUserLanguages.mockResolvedValue({
            languages: [{ id: "lang-1", name: "English" }],
        })
        mockGetAvailableLanguages.mockResolvedValue([
            { id: "lang-1", name: "English" },
            { id: "lang-2", name: "Spanish" },
        ])

        await mount(
            <UserLanguagesTab
                params={Promise.resolve({ userId: "user-2", locale: "en" })}
            />,
        )

        expect(mockGetUserLanguages).toHaveBeenCalledWith("user-2")
        expect(mockGetAvailableLanguages).toHaveBeenCalled()
        expect(screen.getByTestId("can-manage")).toHaveTextContent("true")
        expect(screen.getByTestId("languages-count")).toHaveTextContent("1")
    })

    it("renders LanguagesPage with canManageLanguages = false when regular user views another profile", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-1",
            role: "User",
        })
        mockGetUserLanguages.mockResolvedValue({ languages: [] })
        mockGetAvailableLanguages.mockResolvedValue([])

        await mount(
            <UserLanguagesTab
                params={Promise.resolve({ userId: "user-2", locale: "en" })}
            />,
        )

        expect(screen.getByTestId("can-manage")).toHaveTextContent("false")
        expect(screen.getByTestId("languages-count")).toHaveTextContent("0")
    })
})
