import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { BaseModal } from "@/components/ui/base-modal"

import { EnvironmentMultiselect } from "../ui/environment-multiselect"

describe("EnvironmentMultiselect", () => {
    const mockOnChange = vi.fn()
    const options = ["React", "Node.js", "TypeScript", "Python"]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it("renders with placeholder when no values are selected", () => {
        render(
            <EnvironmentMultiselect
                options={options}
                value={[]}
                onChange={mockOnChange}
                placeholder="Select environment"
            />,
        )

        expect(screen.getByText("Select environment")).toBeInTheDocument()
    })

    it("renders selected items as tags with remove buttons", () => {
        render(
            <EnvironmentMultiselect
                options={options}
                value={["React", "Node.js"]}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.getByText("Node.js")).toBeInTheDocument()
    })

    it("opens dropdown and displays all options when clicked", () => {
        render(
            <EnvironmentMultiselect
                options={options}
                value={[]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Position" }))
        })

        options.forEach((option) => {
            expect(screen.getByText(option)).toBeInTheDocument()
        })
    })

    it("calls onChange with added option when unselected option is clicked", () => {
        render(
            <EnvironmentMultiselect
                options={options}
                value={["React"]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Position" }))
        })

        const portal = document.getElementById("multiselect-dropdown-portal")
        const nodeOption = Array.from(
            portal?.querySelectorAll("span") ?? [],
        ).find((el) => el.textContent === "Node.js")

        expect(nodeOption).not.toBeUndefined()

        act(() => {
            fireEvent.click(nodeOption!)
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(["React", "Node.js"])
    })

    it("calls onChange with removed option when already selected option is clicked in dropdown", () => {
        render(
            <EnvironmentMultiselect
                options={options}
                value={["React", "Node.js"]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Position" }))
        })

        const portal = document.getElementById("multiselect-dropdown-portal")
        const reactOptionInPortal = Array.from(
            portal?.querySelectorAll("span") ?? [],
        ).find((el) => el.textContent === "React")

        act(() => {
            fireEvent.click(reactOptionInPortal!)
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(["Node.js"])
    })

    it("removes tag directly when tag close button is clicked", () => {
        render(
            <EnvironmentMultiselect
                options={options}
                value={["React", "Node.js"]}
                onChange={mockOnChange}
            />,
        )

        const reactTagSpan = screen
            .getAllByText("React")
            .find(
                (el) => el.tagName === "SPAN" && el.closest("button") === null,
            )
        const badgeContainer = reactTagSpan?.closest("span.inline-flex")
        const removeButton = badgeContainer?.querySelector("button")

        expect(removeButton).not.toBeNull()

        act(() => {
            fireEvent.click(removeButton!)
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(["Node.js"])
    })

    it("closes the dropdown on Escape and leaves the parent dialog open", async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        render(
            <BaseModal
                isOpen
                onClose={onClose}
                title="Project"
                isPending={false}
                cancelText="Cancel"
                confirmText="Save"
                pendingText="Saving"
            >
                <EnvironmentMultiselect
                    options={options}
                    value={[]}
                    onChange={mockOnChange}
                    placeholder="Select environment"
                />
            </BaseModal>,
        )

        const trigger = screen.getByRole("button", {
            name: "Select environment",
        })
        await new Promise((resolve) => setTimeout(resolve, 60))
        await user.click(trigger)

        expect(
            document.getElementById("multiselect-dropdown-portal"),
        ).not.toBeNull()

        await user.keyboard("{Escape}")

        expect(
            document.getElementById("multiselect-dropdown-portal"),
        ).toBeNull()
        expect(onClose).not.toHaveBeenCalled()
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })

    it("renders error message when error prop is provided", () => {
        render(
            <EnvironmentMultiselect
                options={options}
                value={[]}
                onChange={mockOnChange}
                error="Environment is required"
            />,
        )

        expect(screen.getByText("Environment is required")).toBeInTheDocument()
    })
})
