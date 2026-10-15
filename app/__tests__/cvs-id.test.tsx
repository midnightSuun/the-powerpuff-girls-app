import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Page from "../[locale]/(protected)/cv/[id]/page"

vi.mock("@/modules/cvs", () => ({
    CvDetailsPage: ({ id, activeTab }: { id: string; activeTab: string }) => (
        <div data-testid="cv-details-content">
            <span data-testid="cv-id">{id}</span>
            <span data-testid="cv-tab">{activeTab}</span>
        </div>
    ),
    CvDetailsSkeleton: ({ tab }: { tab: string }) => (
        <div data-testid="cv-details-skeleton">
            <span data-testid="skeleton-tab">{tab}</span>
        </div>
    ),
}))

describe("CvDetails Server Page", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders CvDetailsContent with the correct id and activeTab parameter inside Suspense", async () => {
        const params = Promise.resolve({ id: "cv-123" })

        const ResolvedPage = await Page({ params })

        await act(async () => {
            render(ResolvedPage)
        })

        await waitFor(() => {
            expect(screen.getByTestId("cv-details-content")).toBeInTheDocument()
        })

        expect(screen.getByTestId("cv-id")).toHaveTextContent("cv-123")
        expect(screen.getByTestId("cv-tab")).toHaveTextContent("details")
    })
})
