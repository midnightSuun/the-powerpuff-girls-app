import { render } from "@testing-library/react"

import { ChevronIcon, UserIcon } from "../icons"

describe("ChevronIcon", () => {
    it("renders an image", () => {
        const { container } = render(<ChevronIcon />)

        const img = container.querySelector("img")
        expect(img).toBeInTheDocument()
    })

    it("has correct src attribute", () => {
        const { container } = render(<ChevronIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveAttribute("src", "/header/chevron.svg")
    })

    it("has correct dimensions", () => {
        const { container } = render(<ChevronIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveAttribute("width", "20")
        expect(img).toHaveAttribute("height", "20")
    })

    it("has empty alt text for decorative icon", () => {
        const { container } = render(<ChevronIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveAttribute("alt", "")
    })

    it("has shrink-0 class to prevent flex shrinking", () => {
        const { container } = render(<ChevronIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveClass("shrink-0")
    })
})

describe("UserIcon", () => {
    it("renders an image", () => {
        const { container } = render(<UserIcon />)

        const img = container.querySelector("img")
        expect(img).toBeInTheDocument()
    })

    it("has correct src attribute", () => {
        const { container } = render(<UserIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveAttribute("src", "/header/user.svg")
    })

    it("has correct dimensions", () => {
        const { container } = render(<UserIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveAttribute("width", "24")
        expect(img).toHaveAttribute("height", "24")
    })

    it("has empty alt text for decorative icon", () => {
        const { container } = render(<UserIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveAttribute("alt", "")
    })

    it("has shrink-0 class to prevent flex shrinking", () => {
        const { container } = render(<UserIcon />)

        const img = container.querySelector("img")
        expect(img).toHaveClass("shrink-0")
    })

    it("renders as inline element", () => {
        const { container } = render(<UserIcon />)

        const img = container.querySelector("img")
        expect(img?.tagName.toLowerCase()).toBe("img")
    })
})

describe("Icon integration", () => {
    it("ChevronIcon and UserIcon render with different sources", () => {
        const { container: chevronContainer } = render(<ChevronIcon />)
        const { container: userContainer } = render(<UserIcon />)

        const chevronImg = chevronContainer.querySelector("img")
        const userImg = userContainer.querySelector("img")

        expect(chevronImg?.getAttribute("src")).not.toBe(
            userImg?.getAttribute("src"),
        )
    })

    it("icons have different dimensions", () => {
        const { container: chevronContainer } = render(<ChevronIcon />)
        const { container: userContainer } = render(<UserIcon />)

        const chevronImg = chevronContainer.querySelector("img")
        const userImg = userContainer.querySelector("img")

        expect(chevronImg?.getAttribute("width")).toBe("20")
        expect(userImg?.getAttribute("width")).toBe("24")
    })

    it("both icons use SVG format", () => {
        const { container: chevronContainer } = render(<ChevronIcon />)
        const { container: userContainer } = render(<UserIcon />)

        const chevronImg = chevronContainer.querySelector("img")
        const userImg = userContainer.querySelector("img")

        expect(chevronImg?.getAttribute("src")).toContain(".svg")
        expect(userImg?.getAttribute("src")).toContain(".svg")
    })

    it("icons render in header subdirectory", () => {
        const { container: chevronContainer } = render(<ChevronIcon />)
        const { container: userContainer } = render(<UserIcon />)

        const chevronImg = chevronContainer.querySelector("img")
        const userImg = userContainer.querySelector("img")

        expect(chevronImg?.getAttribute("src")).toContain("/header/")
        expect(userImg?.getAttribute("src")).toContain("/header/")
    })
})
