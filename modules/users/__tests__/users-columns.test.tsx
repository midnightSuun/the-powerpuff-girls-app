import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { type GetUsersQuery } from "@/gql"

import { getUsersColumns } from "../ui/users-columns"

type User = GetUsersQuery["users"]["items"][number]

vi.mock("../ui/user-avatar", () => ({
    UserAvatar: vi.fn(() => <div data-testid="user-avatar" />),
}))

vi.mock("../ui/user-row-menu", () => ({
    UserRowMenu: vi.fn(({ label }: { label: string }) => (
        <div data-testid="user-row-menu">{label}</div>
    )),
}))

vi.mock("lucide-react", () => ({
    ChevronRight: vi.fn(() => <div data-testid="chevron-right" />),
}))

describe("getUsersColumns Helper", () => {
    const mockTranslator = vi.fn(
        (key: string, values?: Record<string, string>) => {
            if (key === "sortBy") return `Sort by ${values?.column ?? ""}`
            return key
        },
    )

    const sampleUser: User = {
        id: "user-1",
        email: "john@example.com",
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: "avatar.jpg",
        },
        department: { id: "dep-1", name: "Engineering" },
        position: { id: "pos-1", name: "Developer" },
        role: "Admin" as const,
    }

    it("generates all columns with correct labels and sort properties", () => {
        const columns = getUsersColumns(mockTranslator, false)

        expect(columns).toHaveLength(7)
        expect(columns[0].id).toBe("avatar")
        expect(columns[1].id).toBe("firstName")
        expect(columns[1].label).toBe("firstName")
        expect(columns[1].sortKey).toBe("first_name")
        expect(columns[1].sortLabel).toBe("Sort by firstName")

        expect(columns[2].id).toBe("lastName")
        expect(columns[3].id).toBe("email")
        expect(columns[4].id).toBe("department")
        expect(columns[5].id).toBe("position")
        expect(columns[6].id).toBe("open")
    })

    it("renders UserAvatar and correct user details via column render functions", () => {
        const columns = getUsersColumns(mockTranslator, false)

        const avatarResult = columns[0].render(sampleUser)
        render(<div>{avatarResult}</div>)
        expect(screen.getByTestId("user-avatar")).toBeInTheDocument()

        expect(columns[1].render(sampleUser)).toBe("John")
        expect(columns[2].render(sampleUser)).toBe("Doe")
        expect(columns[3].render(sampleUser)).toBe("john@example.com")
        expect(columns[4].render(sampleUser)).toBe("Engineering")
        expect(columns[5].render(sampleUser)).toBe("Developer")
    })

    it("renders ChevronRight in open column when user is not admin", () => {
        const columns = getUsersColumns(mockTranslator, false)
        const openColumn = columns[6]

        const result = openColumn.render(sampleUser)
        render(<div>{result}</div>)

        expect(screen.getByTestId("chevron-right")).toBeInTheDocument()
        expect(screen.queryByTestId("user-row-menu")).not.toBeInTheDocument()
    })

    it("renders UserRowMenu in open column when user is admin", () => {
        const columns = getUsersColumns(mockTranslator, true)
        const openColumn = columns[6]

        const result = openColumn.render(sampleUser)
        render(<div>{result}</div>)

        expect(screen.getByTestId("user-row-menu")).toHaveTextContent(
            "openMenu",
        )
        expect(screen.queryByTestId("chevron-right")).not.toBeInTheDocument()
    })
})
