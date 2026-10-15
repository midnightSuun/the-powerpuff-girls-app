import { act, render, screen, waitFor } from "@testing-library/react"
import { Suspense } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import SkillsPage from "../[locale]/(protected)/users/[userId]/skills/page"

const mockGetCurrentSession = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

const mockGetUserSkills = vi.fn()
vi.mock("@/modules/skills/api/skills", () => ({
    getUserSkills: (userId: string) => mockGetUserSkills(userId),
}))

vi.mock("@/modules/skills/ui/skills", () => ({
    Skills: ({
        userSkills,
        canManageSkills,
    }: {
        userSkills: unknown[]
        canManageSkills: boolean
    }) => (
        <div data-testid="skills-component">
            <span data-testid="skills-count">{userSkills.length}</span>
            <span data-testid="can-manage">{String(canManageSkills)}</span>
        </div>
    ),
}))

vi.mock("@/components/progress-list-skeleton", () => ({
    ProgressListSkeleton: () => (
        <div data-testid="progress-list-skeleton">Loading...</div>
    ),
}))

describe("SkillsPage Server Component (User Skills Tab)", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders Skills with canManageSkills = true when user is Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
        })
        mockGetUserSkills.mockResolvedValue([
            { id: "skill-1", name: "TypeScript" },
        ])

        const params = Promise.resolve({ userId: "user-2", locale: "en" })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <SkillsPage params={params} />
                </Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("skills-component")).toBeInTheDocument()
        })

        expect(mockGetUserSkills).toHaveBeenCalledWith("user-2")
        expect(screen.getByTestId("skills-count")).toHaveTextContent("1")
        expect(screen.getByTestId("can-manage")).toHaveTextContent("true")
    })

    it("renders Skills with canManageSkills = false when regular user views another profile", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-1",
            role: "User",
        })
        mockGetUserSkills.mockResolvedValue([])

        const params = Promise.resolve({ userId: "user-2", locale: "en" })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <SkillsPage params={params} />
                </Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("skills-component")).toBeInTheDocument()
        })

        expect(screen.getByTestId("skills-count")).toHaveTextContent("0")
        expect(screen.getByTestId("can-manage")).toHaveTextContent("false")
    })
})
