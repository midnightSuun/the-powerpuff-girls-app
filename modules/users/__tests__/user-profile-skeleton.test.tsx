import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UserProfileSkeleton } from "../ui/user-profile-skeleton"

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: vi.fn(({ className }) => (
        <div data-testid="skeleton" className={className} />
    )),
}))

describe("UserProfileSkeleton Component", () => {
    it("renders skeleton container with aria-busy attribute", () => {
        const { container } = render(<UserProfileSkeleton />)

        const busyContainer = container.querySelector('[aria-busy="true"]')
        expect(busyContainer).toBeInTheDocument()
    })

    it("renders avatar and user info skeleton elements", () => {
        render(<UserProfileSkeleton />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons.length).toBeGreaterThanOrEqual(12)
    })

    it("renders all profile fields skeletons (firstName, lastName, department, position)", () => {
        const { container } = render(<UserProfileSkeleton />)

        expect(container.querySelector(".h-3.w-20")).toBeInTheDocument()
        expect(container.querySelector(".h-3.w-24")).toBeInTheDocument()
        expect(container.querySelector(".h-3.w-16")).toBeInTheDocument()
    })

    it("renders action buttons skeletons in the footer", () => {
        render(<UserProfileSkeleton />)

        const actionSkeletons = screen
            .getAllByTestId("skeleton")
            .filter((el) => el.classList.contains("h-9"))
        expect(actionSkeletons.length).toBe(2)
    })
})
