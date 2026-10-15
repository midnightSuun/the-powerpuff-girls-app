import { act, render, screen, waitFor } from "@testing-library/react"
import { Suspense } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import UserTabRoute from "../[locale]/(protected)/users/[userId]/profile/page"

vi.mock("@/modules/users", () => ({
    UserPage: ({ userId }: { userId: string }) => (
        <div data-testid="user-page">
            <span data-testid="user-id">{userId}</span>
        </div>
    ),
    UserProfileSkeleton: () => (
        <div data-testid="user-profile-skeleton">Loading profile...</div>
    ),
}))

describe("UserTabRoute Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders UserPage with correct userId successfully", async () => {
        const params = Promise.resolve({ locale: "en", userId: "user-123" })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <UserTabRoute params={params} />
                </Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("user-page")).toBeInTheDocument()
        })

        expect(screen.getByTestId("user-id")).toHaveTextContent("user-123")
    })
})
