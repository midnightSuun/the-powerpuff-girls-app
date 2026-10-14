import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UserAvatar } from "../ui/user-avatar"

vi.mock("@/components/ui/avatar", () => ({
    Avatar: vi.fn(({ children, className, ...props }) => (
        <div data-testid="avatar" className={className} {...props}>
            {children}
        </div>
    )),
    AvatarImage: vi.fn(({ src, alt, ...props }) => (
        <img data-testid="avatar-image" src={src} alt={alt} {...props} />
    )),
    AvatarFallback: vi.fn(({ children, className, ...props }) => (
        <div data-testid="avatar-fallback" className={className} {...props}>
            {children}
        </div>
    )),
}))

vi.mock("../get-user-display-name", () => ({
    getUserDisplayName: vi.fn((firstName, lastName, email) => {
        if (firstName || lastName) {
            return `${firstName || ""} ${lastName || ""}`.trim()
        }
        return email
    }),
}))

describe("UserAvatar Component", () => {
    const defaultProps = {
        src: null,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
    }

    it("renders avatar image with correct src and alt when src is provided", () => {
        render(
            <UserAvatar
                {...defaultProps}
                src="https://example.com/avatar.jpg"
            />,
        )

        const image = screen.getByTestId("avatar-image")
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg")
        expect(image).toHaveAttribute("alt", "John Doe")
    })

    it("does not render avatar image when src is null", () => {
        render(<UserAvatar {...defaultProps} src={null} />)

        expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument()
    })

    it("extracts and displays initial from firstName if available", () => {
        render(
            <UserAvatar
                {...defaultProps}
                firstName="  Alice  "
                lastName="Smith"
            />,
        )

        const fallback = screen.getByTestId("avatar-fallback")
        expect(fallback).toHaveTextContent("A")
    })

    it("falls back to lastName initial if firstName is missing", () => {
        render(
            <UserAvatar
                {...defaultProps}
                firstName={null}
                lastName="  Brown  "
            />,
        )

        const fallback = screen.getByTestId("avatar-fallback")
        expect(fallback).toHaveTextContent("B")
    })

    it("falls back to email initial if both firstName and lastName are missing", () => {
        render(
            <UserAvatar
                src={null}
                firstName={null}
                lastName={null}
                email="support@example.com"
            />,
        )

        const fallback = screen.getByTestId("avatar-fallback")
        expect(fallback).toHaveTextContent("S")
    })

    it("applies custom avatarClassName and fallbackClassName correctly", () => {
        render(
            <UserAvatar
                {...defaultProps}
                avatarClassName="custom-avatar-class"
                fallbackClassName="custom-fallback-class"
            />,
        )

        const avatar = screen.getByTestId("avatar")
        expect(avatar).toHaveClass("custom-avatar-class")

        const fallback = screen.getByTestId("avatar-fallback")
        expect(fallback).toHaveClass("rounded-full", "custom-fallback-class")
    })
})
