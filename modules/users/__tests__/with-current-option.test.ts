import { describe, expect, it } from "vitest"

import { type SelectOption, withCurrentOption } from "../select-option"

describe("withCurrentOption Helper", () => {
    const baseOptions: SelectOption[] = [
        { id: "1", name: "Option One" },
        { id: "2", name: "Option Two" },
    ]

    it("returns original options as-is if current option is null or undefined", () => {
        expect(withCurrentOption(baseOptions, null)).toEqual(baseOptions)
        expect(withCurrentOption(baseOptions, undefined)).toEqual(baseOptions)
    })

    it("returns original options as-is if current option is already present in the list", () => {
        const current: SelectOption = { id: "1", name: "Option One" }
        const result = withCurrentOption(baseOptions, current)

        expect(result).toEqual(baseOptions)
        expect(result).toHaveLength(2)
    })

    it("prepends current option to the beginning of the list if it is not present in the options", () => {
        const current: SelectOption = { id: "3", name: "Option Three" }
        const result = withCurrentOption(baseOptions, current)

        expect(result).toEqual([
            { id: "3", name: "Option Three" },
            { id: "1", name: "Option One" },
            { id: "2", name: "Option Two" },
        ])
        expect(result).toHaveLength(3)
    })

    it("works correctly with an empty options list", () => {
        const current: SelectOption = { id: "1", name: "Only Option" }
        const result = withCurrentOption([], current)

        expect(result).toEqual([current])
    })
})
