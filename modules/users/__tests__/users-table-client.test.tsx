import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { getUsersColumns } from "../ui/users-columns"
import { type UserItem, UsersTableClient } from "../ui/users-table-client"

vi.mock("@/components/table", () => ({
    TableComponent: vi.fn(
        (props: {
            data: UserItem[]
            columns: unknown[]
            sortBy?: string
            sortOrder?: string
            emptyMessage: string
            getSortHref: (key: string) => string
            getRowHref: (user: UserItem) => string
            getRowKey: (user: UserItem) => string
        }) => {
            const testSortHref = props.getSortHref("first_name")
            const testRowHref = props.getRowHref(props.data[0])
            const testRowKey = props.getRowKey(props.data[0])

            return (
                <div
                    data-testid="table-component"
                    data-empty-message={props.emptyMessage}
                    data-sort-href={testSortHref}
                    data-row-href={testRowHref}
                    data-row-key={testRowKey}
                    data-data-length={props.data.length}
                />
            )
        },
    ),
}))

vi.mock("../ui/users-columns", () => ({
    getUsersColumns: vi.fn(() => [{ id: "mock-column" }]),
}))

describe("UsersTableClient Component", () => {
    const sampleUser: UserItem = {
        id: "user-1",
        email: "john@example.com",
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: "avatar.jpg",
        },
        department: { id: "dep-1", name: "Engineering" },
        position: { id: "pos-1", name: "Developer" },
        role: "Employee" as const,
    }

    const defaultProps = {
        users: [sampleUser],
        isAdmin: false,
        limit: 10,
        search: "query",
        sortBy: "first_name",
        sortOrder: "asc" as const,
        emptyMessage: "No users found",
    }

    it("renders TableComponent with correct props, columns, and empty message", () => {
        render(<UsersTableClient {...defaultProps} />)

        expect(getUsersColumns).toHaveBeenCalledTimes(1)
        expect(getUsersColumns).toHaveBeenCalledWith(
            expect.any(Function),
            false,
        )

        const tableComponent = screen.getByTestId("table-component")
        expect(tableComponent).toBeInTheDocument()
        expect(tableComponent).toHaveAttribute(
            "data-empty-message",
            "No users found",
        )
        expect(tableComponent).toHaveAttribute("data-data-length", "1")
        expect(tableComponent).toHaveAttribute("data-row-key", "user-1")
        expect(tableComponent).toHaveAttribute("data-row-href", "/users/user-1")
    })

    it("generates correct sort href toggling order to desc when clicking active sort column", () => {
        render(
            <UsersTableClient
                {...defaultProps}
                sortBy="first_name"
                sortOrder="asc"
            />,
        )

        const tableComponent = screen.getByTestId("table-component")
        expect(tableComponent).toHaveAttribute(
            "data-sort-href",
            "/users?page=1&limit=10&search=query&sortBy=first_name&sortOrder=desc",
        )
    })

    it("generates correct sort href setting order to asc when clicking inactive or desc column", () => {
        render(
            <UsersTableClient
                {...defaultProps}
                sortBy="last_name"
                sortOrder="asc"
            />,
        )

        const tableComponent = screen.getByTestId("table-component")
        expect(tableComponent).toHaveAttribute(
            "data-sort-href",
            "/users?page=1&limit=10&search=query&sortBy=first_name&sortOrder=asc",
        )
    })
})
