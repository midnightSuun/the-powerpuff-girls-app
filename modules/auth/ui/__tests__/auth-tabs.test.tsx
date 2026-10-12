import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuthTabs } from "../components/authTabs"

describe("AuthTabs Component", () => {
    it("renders both tabs correctly", () => {
        render(<AuthTabs activeTab="signin" />)

        const signInTab = screen.getByRole("tab", { name: /signin/i })
        const signUpTab = screen.getByRole("tab", { name: /signup/i })

        expect(signInTab).toBeInTheDocument()
        expect(signUpTab).toBeInTheDocument()
    })

    it("marks the signin tab as selected when activeTab is 'signin'", () => {
        render(<AuthTabs activeTab="signin" />)

        const signInTab = screen.getByRole("tab", { name: /signin/i })
        const signUpTab = screen.getByRole("tab", { name: /signup/i })

        expect(signInTab).toHaveAttribute("aria-selected", "true")
        expect(signUpTab).toHaveAttribute("aria-selected", "false")
        expect(signInTab).toHaveAttribute("href", "/login")
    })

    it("marks the signup tab as selected when activeTab is not 'signin'", () => {
        render(<AuthTabs activeTab="signup" />)

        const signInTab = screen.getByRole("tab", { name: /signin/i })
        const signUpTab = screen.getByRole("tab", { name: /signup/i })

        expect(signInTab).toHaveAttribute("aria-selected", "false")
        expect(signUpTab).toHaveAttribute("aria-selected", "true")
        expect(signUpTab).toHaveAttribute("href", "/register")
    })
})
