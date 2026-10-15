import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from "../avatar"

vi.mock("@base-ui/react/avatar", () => ({
    Avatar: {
        Root: ({
            children,
            className,
            "data-size": dataSize,
            "data-slot": dataSlot,
        }: {
            children: React.ReactNode
            className?: string
            "data-size"?: string
            "data-slot"?: string
        }) => (
            <div
                data-testid="avatar-root"
                data-size={dataSize}
                data-slot={dataSlot}
                className={className}
            >
                {children}
            </div>
        ),
        Image: ({
            className,
            src,
            alt,
        }: {
            className?: string
            src?: string
            alt?: string
        }) => (
            <img
                data-testid="avatar-image"
                src={src}
                alt={alt}
                className={className}
            />
        ),
        Fallback: ({
            children,
            className,
        }: {
            children: React.ReactNode
            className?: string
        }) => (
            <div data-testid="avatar-fallback" className={className}>
                {children}
            </div>
        ),
    },
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Avatar components", () => {
    it("renders Avatar root with default size and custom className", () => {
        render(
            <Avatar className="custom-avatar-class">
                <AvatarFallback>VD</AvatarFallback>
            </Avatar>,
        )

        const root = screen.getByTestId("avatar-root")
        expect(root).toBeInTheDocument()
        expect(root).toHaveAttribute("data-size", "default")
        expect(root).toHaveAttribute("data-slot", "avatar")
        expect(root).toHaveClass("custom-avatar-class")
    })

    it("renders Avatar root with 'sm' and 'lg' sizes correctly", () => {
        const { rerender } = render(<Avatar size="sm" />)
        expect(screen.getByTestId("avatar-root")).toHaveAttribute(
            "data-size",
            "sm",
        )

        rerender(<Avatar size="lg" />)
        expect(screen.getByTestId("avatar-root")).toHaveAttribute(
            "data-size",
            "lg",
        )
    })

    it("renders AvatarImage and AvatarFallback correctly", () => {
        render(
            <Avatar>
                <AvatarImage src="/avatar.png" alt="User avatar" />
                <AvatarFallback>VK</AvatarFallback>
            </Avatar>,
        )

        const image = screen.getByTestId("avatar-image")
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute("src", "/avatar.png")
        expect(image).toHaveAttribute("alt", "User avatar")

        const fallback = screen.getByTestId("avatar-fallback")
        expect(fallback).toBeInTheDocument()
        expect(fallback).toHaveTextContent("VK")
    })

    it("renders AvatarBadge correctly", () => {
        render(
            <Avatar>
                <AvatarBadge
                    data-testid="avatar-badge"
                    className="custom-badge"
                >
                    <span>3</span>
                </AvatarBadge>
            </Avatar>,
        )

        const badge = screen.getByTestId("avatar-badge")
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveAttribute("data-slot", "avatar-badge")
        expect(badge).toHaveClass("custom-badge")
    })

    it("renders AvatarGroup and AvatarGroupCount correctly", () => {
        render(
            <AvatarGroup data-testid="avatar-group" className="custom-group">
                <Avatar>
                    <AvatarFallback>1</AvatarFallback>
                </Avatar>
                <AvatarGroupCount data-testid="avatar-count">
                    +5
                </AvatarGroupCount>
            </AvatarGroup>,
        )

        const group = screen.getByTestId("avatar-group")
        expect(group).toBeInTheDocument()
        expect(group).toHaveAttribute("data-slot", "avatar-group")
        expect(group).toHaveClass("custom-group")

        const count = screen.getByTestId("avatar-count")
        expect(count).toBeInTheDocument()
        expect(count).toHaveAttribute("data-slot", "avatar-group-count")
        expect(count).toHaveTextContent("+5")
    })
})
