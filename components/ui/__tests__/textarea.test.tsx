import { fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { Textarea } from "../textarea"

vi.mock("@/lib/utils", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Textarea component", () => {
    it("renders textarea with placeholder and correct base classes", () => {
        render(<Textarea placeholder="Enter your message" />)

        const textarea = screen.getByPlaceholderText("Enter your message")
        expect(textarea).toBeInTheDocument()
        expect(textarea.tagName).toBe("TEXTAREA")
        expect(textarea).toHaveClass(
            "flex",
            "min-h-20",
            "w-full",
            "rounded-none",
        )
    })

    it("handles user typing and calls onChange", () => {
        const handleChange = vi.fn()
        render(<Textarea placeholder="Type here..." onChange={handleChange} />)

        const textarea = screen.getByPlaceholderText("Type here...")
        fireEvent.change(textarea, { target: { value: "Hello Vitest" } })

        expect(textarea).toHaveValue("Hello Vitest")
        expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it("applies disabled state correctly", () => {
        render(<Textarea disabled placeholder="Disabled textarea" />)

        const textarea = screen.getByPlaceholderText("Disabled textarea")
        expect(textarea).toBeDisabled()
        expect(textarea).toHaveClass(
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
        )
    })

    it("forwards ref to the underlying textarea element", () => {
        const ref = createRef<HTMLTextAreaElement>()
        render(<Textarea ref={ref} placeholder="Ref test" />)

        expect(ref.current).not.toBeNull()
        expect(ref.current?.tagName).toBe("TEXTAREA")
        expect(ref.current).toBe(screen.getByPlaceholderText("Ref test"))
    })
})
