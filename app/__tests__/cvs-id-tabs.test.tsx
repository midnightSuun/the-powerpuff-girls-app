import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Page from "../[locale]/(protected)/cv/[id]/[tab]/page"

const mockNotFound = vi.fn()
vi.mock("next/navigation", () => ({
    notFound: () => {
        mockNotFound()
        return new Error("NEXT_NOT_FOUND")
    },
}))

vi.mock("@/modules/cvs/ui/cv-details-page", () => ({
    CvDetailsPage: ({ id, activeTab }: { id: string; activeTab: string }) => (
        <div data-testid="cv-details-page">
            <span data-testid="cv-id">{id}</span>
            <span data-testid="active-tab">{activeTab}</span>
        </div>
    ),
}))

vi.mock("@/modules/cvs/ui/cv-details-skeleton", () => ({
    CvDetailsSkeleton: ({ tab }: { tab: string }) => (
        <div data-testid="cv-details-skeleton">
            <span data-testid="skeleton-tab">{tab}</span>
        </div>
    ),
}))

describe("CvTabPage Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders CvDetailsPage with correct id and valid tab successfully", async () => {
        const params = Promise.resolve({ id: "cv-999", tab: "projects" })

        const ResolvedPage = await Page({ params })

        await act(async () => {
            render(ResolvedPage)
        })

        await waitFor(() => {
            expect(screen.getByTestId("cv-details-page")).toBeInTheDocument()
        })

        expect(screen.getByTestId("cv-id")).toHaveTextContent("cv-999")
        expect(screen.getByTestId("active-tab")).toHaveTextContent("projects")
        expect(mockNotFound).not.toHaveBeenCalled()
    })

    it("calls notFound when an invalid tab is provided", async () => {
        const params = Promise.resolve({ id: "cv-999", tab: "invalid-tab" })

        await act(async () => {
            try {
                await Page({ params })
            } catch {}
        })

        expect(mockNotFound).toHaveBeenCalled()
    })
})
