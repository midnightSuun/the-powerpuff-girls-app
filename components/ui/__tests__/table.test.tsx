import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "../table"

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Table components", () => {
    it("renders table structure with caption, header, body, and footer correctly", () => {
        render(
            <Table className="custom-table-class">
                <TableCaption>A list of recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow data-state="selected">
                        <TableCell>INV001</TableCell>
                        <TableCell>Paid</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Total</TableCell>
                        <TableCell>$250.00</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>,
        )

        const tableContainer = document.querySelector(
            '[data-slot="table-container"]',
        )
        expect(tableContainer).toBeInTheDocument()

        const table = document.querySelector('[data-slot="table"]')
        expect(table).toBeInTheDocument()
        expect(table).toHaveClass("custom-table-class")

        const caption = document.querySelector('[data-slot="table-caption"]')
        expect(caption).toBeInTheDocument()
        expect(caption).toHaveTextContent("A list of recent invoices.")

        const header = document.querySelector('[data-slot="table-header"]')
        expect(header).toBeInTheDocument()
        expect(screen.getByText("Invoice")).toBeInTheDocument()
        expect(screen.getByText("Status")).toBeInTheDocument()

        const body = document.querySelector('[data-slot="table-body"]')
        expect(body).toBeInTheDocument()
        const selectedRow = document.querySelector('[data-state="selected"]')
        expect(selectedRow).toBeInTheDocument()
        expect(screen.getByText("INV001")).toBeInTheDocument()
        expect(screen.getByText("Paid")).toBeInTheDocument()

        const footer = document.querySelector('[data-slot="table-footer"]')
        expect(footer).toBeInTheDocument()
        expect(screen.getByText("Total")).toBeInTheDocument()
        expect(screen.getByText("$250.00")).toBeInTheDocument()
    })
})
