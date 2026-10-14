import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UsersTableFrame } from "../ui/users-table-frame"

vi.mock("../ui/users-table-skeleton", () => ({
    UsersTableSkeleton: vi.fn(() => (
        <div data-testid="default-skeleton">Loading skeleton...</div>
    )),
}))

describe("UsersTableFrame Component", () => {
    it("renders children when resolved", async () => {
        const ResolvedChild = () => (
            <div data-testid="resolved-content">Table Content</div>
        )

        render(
            <UsersTableFrame>
                <ResolvedChild />
            </UsersTableFrame>,
        )

        const content = await screen.findByTestId("resolved-content")
        expect(content).toBeInTheDocument()
        expect(content).toHaveTextContent("Table Content")
    })

    it("renders default skeleton placeholder when suspended initially and no previous state exists", () => {
        const infinitePromise = new Promise(() => {})
        const SuspendingChild = () => {
            throw infinitePromise
        }

        render(
            <UsersTableFrame>
                <SuspendingChild />
            </UsersTableFrame>,
        )

        const skeleton = screen.getByTestId("default-skeleton")
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveTextContent("Loading skeleton...")
    })

    it("renders custom placeholder when suspended initially if provided", () => {
        const infinitePromise = new Promise(() => {})
        const SuspendingChild = () => {
            throw infinitePromise
        }

        render(
            <UsersTableFrame
                placeholder={
                    <div data-testid="custom-placeholder">
                        Custom Loading...
                    </div>
                }
            >
                <SuspendingChild />
            </UsersTableFrame>,
        )

        const placeholder = screen.getByTestId("custom-placeholder")
        expect(placeholder).toBeInTheDocument()
        expect(placeholder).toHaveTextContent("Custom Loading...")
    })
})
