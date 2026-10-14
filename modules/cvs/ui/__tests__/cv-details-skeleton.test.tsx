import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CvDetailsSkeleton } from "../cv-details-skeleton"

vi.mock("@/components/progress-list-skeleton", () => ({
    ProgressListSkeleton: ({
        compact,
        groups,
    }: {
        compact?: boolean
        groups?: number
    }) => (
        <div data-testid="progress-list-skeleton">
            <span data-testid="skeleton-compact">{String(compact)}</span>
            <span data-testid="skeleton-groups">{groups}</span>
        </div>
    ),
}))

vi.mock("@/components/project-list-skeleton", () => ({
    ProjectListSkeleton: () => <div data-testid="project-list-skeleton" />,
}))

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: ({ className }: { className?: string }) => (
        <div data-testid="skeleton" className={className} />
    ),
}))

describe("CvDetailsSkeleton", () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it("renders with aria-busy attribute wrapping the content", () => {
        render(<CvDetailsSkeleton tab="details" />)

        const mainContainer = screen.getByRole("main", { busy: true })
        expect(mainContainer).toBeInTheDocument()
    })

    it("renders DetailsFormSkeleton when tab is 'details'", () => {
        render(<CvDetailsSkeleton tab="details" />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it("renders ProgressListSkeleton with correct props when tab is 'skills'", () => {
        render(<CvDetailsSkeleton tab="skills" />)

        expect(screen.getByTestId("progress-list-skeleton")).toBeInTheDocument()
        expect(screen.getByTestId("skeleton-compact")).toHaveTextContent("true")
        expect(screen.getByTestId("skeleton-groups")).toHaveTextContent("2")
    })

    it("renders ProjectListSkeleton when tab is 'projects'", () => {
        render(<CvDetailsSkeleton tab="projects" />)

        expect(screen.getByTestId("project-list-skeleton")).toBeInTheDocument()
    })

    it("renders PreviewSkeleton when tab is 'preview'", () => {
        render(<CvDetailsSkeleton tab="preview" />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
