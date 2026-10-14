import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UsersList } from "../ui/users-list"
import { UsersPage } from "../ui/users-page"

vi.mock("../ui/users-list", () => ({
    UsersList: vi.fn(
        (props: {
            limit: number
            page: number
            search: string
            sortBy: string
            sortOrder: string
        }) => (
            <div
                data-testid="users-list"
                data-limit={props.limit}
                data-page={props.page}
                data-search={props.search}
                data-sort-by={props.sortBy}
                data-sort-order={props.sortOrder}
            />
        ),
    ),
}))

describe("UsersPage Component", () => {
    const defaultProps = {
        limit: 15,
        page: 2,
        search: "test query",
        sortBy: "email" as const,
        sortOrder: "desc" as const,
    }

    it("renders UsersList and passes all search params correctly", () => {
        render(<UsersPage {...defaultProps} />)

        const usersList = screen.getByTestId("users-list")
        expect(usersList).toBeInTheDocument()
        expect(usersList).toHaveAttribute("data-limit", "15")
        expect(usersList).toHaveAttribute("data-page", "2")
        expect(usersList).toHaveAttribute("data-search", "test query")
        expect(usersList).toHaveAttribute("data-sort-by", "email")
        expect(usersList).toHaveAttribute("data-sort-order", "desc")

        expect(UsersList).toHaveBeenCalledTimes(1)
        expect(UsersList).toHaveBeenCalledWith(defaultProps, undefined)
    })
})
