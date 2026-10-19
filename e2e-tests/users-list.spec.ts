import { expect, type Locator, type Page, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"

const columnValues = (page: Page, column: number) =>
    page.locator(`tbody tr td:nth-child(${column})`).allTextContents()

const emails = async (page: Page) =>
    (await columnValues(page, 4)).map((email) => email.trim())

const emailCollator = new Intl.Collator("en", {
    ignorePunctuation: true,
    sensitivity: "base",
})

const relationCollator = new Intl.Collator("en", {
    numeric: true,
    sensitivity: "accent",
})

const isOrdered = (
    values: string[],
    compare: (left: string, right: string) => number,
    order: "asc" | "desc",
) =>
    values.every((value, index) => {
        if (index === 0) return true

        const comparison = compare(values[index - 1], value)

        return order === "asc" ? comparison <= 0 : comparison >= 0
    })

const isEmailSorted = (values: string[], order: "asc" | "desc") =>
    isOrdered(
        values,
        (left, right) => emailCollator.compare(left, right),
        order,
    )

const isRelationSorted = (values: string[], order: "asc" | "desc") => {
    const trimmed = values.map((value) => value.trim())
    const firstEmpty = trimmed.findIndex((value) => value.length === 0)
    const filled = firstEmpty === -1 ? trimmed : trimmed.slice(0, firstEmpty)
    const empty = firstEmpty === -1 ? [] : trimmed.slice(firstEmpty)

    return (
        empty.every((value) => value.length === 0) &&
        isOrdered(
            filled,
            (left, right) => relationCollator.compare(left, right),
            order,
        )
    )
}

const clickSort = async (
    page: Page,
    link: Locator,
    sortBy: string,
    sortOrder: "asc" | "desc",
) => {
    await expect(link).toHaveAttribute(
        "href",
        new RegExp(`sortBy=${sortBy}&sortOrder=${sortOrder}`),
        { timeout: 15_000 },
    )
    await link.click()
    await expectQuery(page, { sortBy, sortOrder, page: "1" })
    await expect(link).toHaveAttribute(
        "href",
        new RegExp(`sortOrder=${sortOrder === "asc" ? "desc" : "asc"}`),
        { timeout: 15_000 },
    )
}

const expectQuery = async (
    page: Page,
    expected: {
        search?: string | null
        sortBy?: string
        sortOrder?: string
        page?: string
    },
) => {
    await expect(page).toHaveURL(
        (url) => {
            const searchMatches =
                expected.search === undefined
                    ? true
                    : expected.search === null
                      ? !url.searchParams.has("search")
                      : url.searchParams.get("search") === expected.search
            const sortByMatches =
                expected.sortBy === undefined ||
                url.searchParams.get("sortBy") === expected.sortBy
            const sortOrderMatches =
                expected.sortOrder === undefined ||
                url.searchParams.get("sortOrder") === expected.sortOrder
            const pageMatches =
                expected.page === undefined ||
                url.searchParams.get("page") === expected.page

            return (
                searchMatches &&
                sortByMatches &&
                sortOrderMatches &&
                pageMatches
            )
        },
        { timeout: 15_000 },
    )
}

test.describe("Users list for an employee", () => {
    test("should search and sort the users list", async ({ page }) => {
        test.setTimeout(120_000)

        const { uniqueEmail } = await registerAndSkipVerification(page)
        const localPart = uniqueEmail.split("@")[0]

        const usersTable = page.locator("table").first()
        await expect(usersTable).toBeVisible()

        const search = page.getByRole("searchbox", { name: "Search" })
        const rows = usersTable.locator("tbody tr")

        await search.fill(uniqueEmail)
        await expectQuery(page, { search: uniqueEmail, page: "1" })
        await expect(rows).toHaveCount(1, { timeout: 15_000 })
        await expect(rows).toContainText(uniqueEmail)

        await search.fill(localPart)
        await expectQuery(page, { search: localPart, page: "1" })
        await expect(rows).toHaveCount(1, { timeout: 15_000 })
        await expect(rows).toContainText(uniqueEmail)

        await search.fill("@example.com")
        await expectQuery(page, { search: "@example.com", page: "1" })
        await expect
            .poll(async () => rows.count(), { timeout: 15_000 })
            .toBeGreaterThan(1)
        const sharedRows = await rows.allTextContents()
        expect(sharedRows.every((row) => row.includes("@example.com"))).toBe(
            true,
        )

        await search.fill(`missing-${Date.now()}@invalid.test`)
        await expect(page.getByText("No results")).toBeVisible({
            timeout: 15_000,
        })

        await search.fill("   ")
        await expectQuery(page, { search: null })
        await expect(page.getByText("No results")).toBeHidden({
            timeout: 15_000,
        })
        await expect(rows.first()).toBeVisible()

        const sortByEmail = page.getByRole("link", { name: "Sort by Email" })

        await clickSort(page, sortByEmail, "email", "asc")
        const ascendingEmails = await emails(page)
        expect(ascendingEmails.length).toBeGreaterThan(1)
        expect(isEmailSorted(ascendingEmails, "asc")).toBe(true)

        await clickSort(page, sortByEmail, "email", "desc")
        const descendingEmails = await emails(page)
        expect(descendingEmails.length).toBeGreaterThan(1)
        expect(isEmailSorted(descendingEmails, "desc")).toBe(true)

        await clickSort(page, sortByEmail, "email", "asc")
        expect(isEmailSorted(await emails(page), "asc")).toBe(true)

        await clickSort(page, sortByEmail, "email", "desc")
        await search.fill(uniqueEmail)
        await expectQuery(page, {
            search: uniqueEmail,
            sortBy: "email",
            sortOrder: "desc",
            page: "1",
        })
        await expect(rows).toHaveCount(1, { timeout: 15_000 })
        await expect(rows).toContainText(uniqueEmail)

        await search.fill("")
        await expectQuery(page, {
            search: null,
            sortBy: "email",
            sortOrder: "desc",
        })

        await clickSort(
            page,
            page.getByRole("link", { name: "Sort by First Name" }),
            "first_name",
            "asc",
        )

        await clickSort(
            page,
            page.getByRole("link", { name: "Sort by Last Name" }),
            "last_name",
            "asc",
        )

        const sortByDepartment = page.getByRole("link", {
            name: "Sort by Department",
        })
        await clickSort(page, sortByDepartment, "department", "asc")
        const departments = await columnValues(page, 5)
        expect(departments.length).toBeGreaterThan(1)
        expect(isRelationSorted(departments, "asc")).toBe(true)

        await clickSort(page, sortByDepartment, "department", "desc")
        expect(isRelationSorted(await columnValues(page, 5), "desc")).toBe(true)

        const sortByPosition = page.getByRole("link", {
            name: "Sort by Position",
        })
        await clickSort(page, sortByPosition, "position", "asc")
        const positions = await columnValues(page, 6)
        expect(positions.length).toBeGreaterThan(1)
        expect(isRelationSorted(positions, "asc")).toBe(true)

        await clickSort(page, sortByPosition, "position", "desc")
        expect(isRelationSorted(await columnValues(page, 6), "desc")).toBe(true)

        await search.fill(uniqueEmail)
        await expectQuery(page, {
            search: uniqueEmail,
            sortBy: "position",
            sortOrder: "desc",
            page: "1",
        })
        await expect(rows).toHaveCount(1, { timeout: 15_000 })
    })
})
