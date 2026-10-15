import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useProjectsTable } from "../use-projects-table"

type ProjectRow = {
    name: string
    domain: string
    description: string
    environment: string[]
    start_date?: string | null
    end_date?: string | null
}

const projects: ProjectRow[] = [
    {
        name: "Beta",
        domain: "Finance",
        description: "Ledger service",
        environment: ["Node", "Postgres"],
        start_date: "2024-05-01",
        end_date: "2024-12-01",
    },
    {
        name: "Alpha",
        domain: "Mobile",
        description: "Client app",
        environment: ["React Native"],
        start_date: "2023-01-15",
        end_date: null,
    },
    {
        name: "  ",
        domain: "Internal",
        description: "Draft",
        environment: ["AWS"],
        start_date: null,
        end_date: "2022-01-01",
    },
]

const namesOf = (items: ProjectRow[]) => items.map((item) => item.name)

describe("useProjectsTable", () => {
    const renderTable = (search = "") =>
        renderHook(
            (props: { search: string }) =>
                useProjectsTable({
                    items: projects,
                    locale: "en",
                    search: props.search,
                }),
            { initialProps: { search } },
        )

    it("sorts by name ascending and keeps blank names last", () => {
        const { result } = renderTable()

        expect(namesOf(result.current.visibleItems)).toEqual([
            "Alpha",
            "Beta",
            "  ",
        ])
        expect(result.current.sortField).toBe("name")
        expect(result.current.sortDirection).toBe("asc")
        expect(result.current.itemToRemove).toBeNull()
        expect(namesOf(projects)).toEqual(["Beta", "Alpha", "  "])
    })

    it("filters by name, domain, description, and environment", () => {
        const { result, rerender } = renderTable("postgres")

        expect(namesOf(result.current.visibleItems)).toEqual(["Beta"])

        rerender({ search: " CLIENT " })
        expect(namesOf(result.current.visibleItems)).toEqual(["Alpha"])

        rerender({ search: "finance ledger" })
        expect(namesOf(result.current.visibleItems)).toEqual(["Beta"])

        rerender({ search: "aws" })
        expect(namesOf(result.current.visibleItems)).toEqual(["  "])

        rerender({ search: "missing" })
        expect(result.current.visibleItems).toEqual([])

        rerender({ search: "   " })
        expect(result.current.visibleItems).toHaveLength(projects.length)
    })

    it("toggles the sort column and direction", () => {
        const { result } = renderTable()

        act(() => {
            result.current.toggleSort("name")
        })

        expect(result.current.sortField).toBe("name")
        expect(result.current.sortDirection).toBe("desc")
        expect(namesOf(result.current.visibleItems)).toEqual([
            "Beta",
            "Alpha",
            "  ",
        ])

        act(() => {
            result.current.toggleSort("start_date")
        })

        expect(result.current.sortField).toBe("start_date")
        expect(result.current.sortDirection).toBe("asc")
        expect(namesOf(result.current.visibleItems)).toEqual([
            "Alpha",
            "Beta",
            "  ",
        ])

        act(() => {
            result.current.toggleSort("end_date")
        })

        expect(namesOf(result.current.visibleItems)).toEqual([
            "  ",
            "Beta",
            "Alpha",
        ])
    })

    it("stores the item selected for removal", () => {
        const { result } = renderTable()

        act(() => {
            result.current.setItemToRemove(projects[0])
        })

        expect(result.current.itemToRemove).toBe(projects[0])

        act(() => {
            result.current.setItemToRemove(null)
        })

        expect(result.current.itemToRemove).toBeNull()
    })
})
