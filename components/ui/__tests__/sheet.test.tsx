import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../sheet"

describe("Sheet Component", () => {
    const TestSheet = ({
        side,
        showCloseButton,
    }: {
        side?: "top" | "right" | "bottom" | "left"
        showCloseButton?: boolean
    }) => (
        <Sheet>
            <SheetTrigger>Open Sheet</SheetTrigger>
            <SheetContent side={side} showCloseButton={showCloseButton}>
                <SheetHeader>
                    <SheetTitle>Test Title</SheetTitle>
                    <SheetDescription>Test Description</SheetDescription>
                </SheetHeader>
                <div>Main Content</div>
                <SheetFooter>
                    <SheetClose>Close Custom</SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )

    it("should open and close the sheet by default", async () => {
        const user = userEvent.setup()
        render(<TestSheet />)

        expect(screen.queryByText("Test Title")).not.toBeInTheDocument()

        await user.click(screen.getByText("Open Sheet"))

        expect(screen.getByText("Test Title")).toBeInTheDocument()
        expect(screen.getByText("Test Description")).toBeInTheDocument()
        expect(screen.getByText("Main Content")).toBeInTheDocument()

        const closeButton = screen.getByRole("button", { name: "Close" })
        await user.click(closeButton)

        await waitFor(() => {
            expect(screen.queryByText("Test Title")).not.toBeInTheDocument()
        })
    })

    it("should close when clicking on custom SheetClose", async () => {
        const user = userEvent.setup()
        render(<TestSheet />)

        await user.click(screen.getByText("Open Sheet"))
        expect(screen.getByText("Test Title")).toBeInTheDocument()

        await user.click(screen.getByText("Close Custom"))

        await waitFor(() => {
            expect(screen.queryByText("Test Title")).not.toBeInTheDocument()
        })
    })

    it("should hide the cross button if showCloseButton={false}", async () => {
        const user = userEvent.setup()
        render(<TestSheet showCloseButton={false} />)

        await user.click(screen.getByText("Open Sheet"))

        expect(
            screen.queryByRole("button", { name: "Close" }),
        ).not.toBeInTheDocument()

        expect(screen.getByText("Close Custom")).toBeInTheDocument()
    })

    it("should apply the correct data-side attribute for positioning", async () => {
        const user = userEvent.setup()

        render(<TestSheet side="left" />)

        await user.click(screen.getByText("Open Sheet"))

        const sheetContent = screen
            .getByText("Main Content")
            .closest("[data-slot='sheet-content']")

        expect(sheetContent).toHaveAttribute("data-side", "left")
    })

    it("should correctly render all structural slots (header, footer, etc.)", async () => {
        const user = userEvent.setup()
        render(<TestSheet />)

        await user.click(screen.getByText("Open Sheet"))

        expect(
            screen.getByText("Test Title").closest("[data-slot='sheet-title']"),
        ).toBeInTheDocument()
        expect(
            screen
                .getByText("Test Description")
                .closest("[data-slot='sheet-description']"),
        ).toBeInTheDocument()
        expect(
            screen
                .getByText("Test Title")
                .closest("[data-slot='sheet-header']"),
        ).toBeInTheDocument()
        expect(
            screen
                .getByText("Close Custom")
                .closest("[data-slot='sheet-footer']"),
        ).toBeInTheDocument()
    })
})
