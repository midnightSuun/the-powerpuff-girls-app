import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Separator } from "../separator"

vi.mock("@base-ui/react/separator", () => ({
    Separator: ({
        className,
        orientation = "horizontal",
        ...props
    }: {
        className?: string
        orientation?: "horizontal" | "vertical"
    } & React.ComponentProps<"div">) => (
        <div
            data-slot="separator"
            data-orientation={orientation}
            className={className}
            {...props}
        />
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Separator component", () => {
    it("renders horizontal separator by default", () => {
        render(<Separator />)

        const separator = document.querySelector('[data-slot="separator"]')
        expect(separator).toBeInTheDocument()
        expect(separator).toHaveAttribute("data-slot", "separator")
        expect(separator).toHaveAttribute("data-orientation", "horizontal")
    })

    it("renders vertical separator when orientation is vertical", () => {
        render(<Separator orientation="vertical" />)

        const separator = document.querySelector('[data-slot="separator"]')
        expect(separator).toBeInTheDocument()
        expect(separator).toHaveAttribute("data-orientation", "vertical")
    })

    it("applies custom className correctly", () => {
        render(<Separator className="my-custom-class" />)

        const separator = document.querySelector('[data-slot="separator"]')
        expect(separator).toHaveClass("my-custom-class")
    })
})
