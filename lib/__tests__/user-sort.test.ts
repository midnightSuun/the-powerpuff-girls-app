import { describe, expect, it } from "vitest"

import { type UserSortField, userSortFields } from "../user-sort"

describe("User Sort Fields Definition", () => {
    it("contains the expected sort fields", () => {
        expect(userSortFields).toEqual([
            "first_name",
            "last_name",
            "email",
            "department",
            "position",
        ])
    })

    it("allows valid UserSortField types assignment", () => {
        const validField: UserSortField = "email"
        expect(userSortFields).toContain(validField)
    })
})
