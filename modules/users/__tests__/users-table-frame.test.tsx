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

    it("renders fallback showing previous content when it exists", async () => {
        const FirstChild = () => (
            <div data-testid="first-child">First Content</div>
        )

        const SecondChild = () => (
            <div data-testid="second-child">Second Content</div>
        )

        const { rerender } = render(
            <UsersTableFrame>
                <FirstChild />
            </UsersTableFrame>,
        )

        await screen.findByTestId("first-child")

        rerender(
            <UsersTableFrame>
                <SecondChild />
            </UsersTableFrame>,
        )

        const secondChild = await screen.findByTestId("second-child")
        expect(secondChild).toBeInTheDocument()
        expect(secondChild).toHaveTextContent("Second Content")

        expect(screen.queryByTestId("first-child")).not.toBeInTheDocument()
    })

    it("does not render placeholder when previous content exists", async () => {
        const Child = () => <div data-testid="child-content">Content</div>

        render(
            <UsersTableFrame
                placeholder={
                    <div data-testid="should-not-appear">Placeholder</div>
                }
            >
                <Child />
            </UsersTableFrame>,
        )

        await screen.findByTestId("child-content")

        expect(
            screen.queryByTestId("should-not-appear"),
        ).not.toBeInTheDocument()
    })

    it("updates previous state when children change and resolve", async () => {
        const FirstChild = () => (
            <div data-testid="first-child">First Content</div>
        )
        const SecondChild = () => (
            <div data-testid="second-child">Second Content</div>
        )

        const { rerender } = render(
            <UsersTableFrame>
                <FirstChild />
            </UsersTableFrame>,
        )

        const firstContent = await screen.findByTestId("first-child")
        expect(firstContent).toBeInTheDocument()

        rerender(
            <UsersTableFrame>
                <SecondChild />
            </UsersTableFrame>,
        )

        const secondContent = await screen.findByTestId("second-child")
        expect(secondContent).toBeInTheDocument()
        expect(secondContent).toHaveTextContent("Second Content")
    })

    it("does not update state when children remain the same", async () => {
        const Child = () => <div data-testid="child-content">Same Content</div>

        const { rerender } = render(
            <UsersTableFrame>
                <Child />
            </UsersTableFrame>,
        )

        const firstRender = await screen.findByTestId("child-content")
        expect(firstRender).toHaveTextContent("Same Content")

        rerender(
            <UsersTableFrame>
                <Child />
            </UsersTableFrame>,
        )

        const afterRerender = screen.getByTestId("child-content")
        expect(afterRerender).toHaveTextContent("Same Content")
    })
})
