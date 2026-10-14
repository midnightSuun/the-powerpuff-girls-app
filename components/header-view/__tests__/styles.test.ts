import { crumbClassName, headerToolbarButtonClassName } from "../styles"

describe("crumbClassName", () => {
    it("is a non-empty string", () => {
        expect(typeof crumbClassName).toBe("string")
        expect(crumbClassName.length).toBeGreaterThan(0)
    })

    it("includes text-base class", () => {
        expect(crumbClassName).toContain("text-base")
    })

    it("includes capitalize class", () => {
        expect(crumbClassName).toContain("capitalize")
    })
})

describe("headerToolbarButtonClassName", () => {
    it("is a non-empty string", () => {
        expect(typeof headerToolbarButtonClassName).toBe("string")
        expect(headerToolbarButtonClassName.length).toBeGreaterThan(0)
    })

    it("includes h-10 class", () => {
        expect(headerToolbarButtonClassName).toContain("h-10")
    })

    it("includes uppercase class", () => {
        expect(headerToolbarButtonClassName).toContain("uppercase")
    })

    it("includes disabled state classes", () => {
        expect(headerToolbarButtonClassName).toContain("disabled:opacity-100")
    })
})
