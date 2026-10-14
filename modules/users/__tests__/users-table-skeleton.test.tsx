import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
    TableSkeleton,
    type TableSkeletonColumn,
} from "@/components/table-skeleton"

import { UsersTableSkeleton } from "../ui/users-table-skeleton"

vi.mock("@/components/table-skeleton", () => ({
    TableSkeleton: vi.fn(({ columns }: { columns: TableSkeletonColumn[] }) => (
        <div
            data-testid="table-skeleton"
            data-columns-count={columns.length}
            data-first-column-id={columns[0]?.id}
            data-last-column-id={columns[columns.length - 1]?.id}
        />
    )),
}))

describe("UsersTableSkeleton Component", () => {
    it("renders TableSkeleton with correct columns configuration", () => {
        render(<UsersTableSkeleton />)

        const skeleton = screen.getByTestId("table-skeleton")
        expect(skeleton).toBeInTheDocument()

        expect(skeleton).toHaveAttribute("data-columns-count", "7")
        expect(skeleton).toHaveAttribute("data-first-column-id", "avatar")
        expect(skeleton).toHaveAttribute("data-last-column-id", "open")

        expect(TableSkeleton).toHaveBeenCalledTimes(1)
        expect(TableSkeleton).toHaveBeenCalledWith(
            expect.objectContaining({
                columns: expect.any(Array),
            }),
            undefined,
        )
    })
})
