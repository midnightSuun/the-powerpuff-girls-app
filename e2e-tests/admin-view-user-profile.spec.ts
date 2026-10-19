import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth-as-admin"

test.describe("Admin view another user profile", () => {
    test("should open another user's profile from the row menu and switch tabs", async ({
        page,
    }) => {
        test.setTimeout(60_000)

        const { adminEmail } = await loginAsAdmin(page)

        const usersTable = page.locator("table, [role='table']").first()
        await expect(usersTable).toBeVisible()

        const otherUserRow = usersTable
            .locator("tbody tr")
            .filter({ hasText: /@/ })
            .filter({ hasNotText: adminEmail })
            .first()
        await expect(otherUserRow).toBeVisible({ timeout: 20_000 })

        const otherUserEmail = (
            await otherUserRow
                .locator("td")
                .filter({ hasText: /@/ })
                .innerText()
        ).trim()
        expect(otherUserEmail).not.toBe(adminEmail)

        await otherUserRow.getByRole("button", { name: "Open menu" }).click()

        const viewMenuItem = page.getByRole("menuitem", {
            name: "View",
            exact: true,
        })
        await expect(viewMenuItem).toBeVisible()
        await viewMenuItem.click()

        await expect(page).toHaveURL(/\/users\/([^/]+)\/profile$/, {
            timeout: 20_000,
        })

        const userId = new URL(page.url()).pathname.match(
            /\/users\/([^/]+)\/profile$/,
        )?.[1]
        expect(userId).toBeTruthy()

        const profileEmail = page.getByRole("paragraph").filter({
            hasText: otherUserEmail,
        })
        await expect(profileEmail).toBeVisible()

        const firstNameInput = page.locator("#profile-first-name")
        const lastNameInput = page.locator("#profile-last-name")
        await expect(firstNameInput).toBeVisible()
        await expect(firstNameInput).toBeEnabled()
        await expect(lastNameInput).toBeEnabled()

        const profileTabs = page.locator("header").filter({
            has: page.getByRole("navigation", { name: "Breadcrumb" }),
        })

        await profileTabs
            .getByRole("link", { name: "Skills", exact: true })
            .click()
        await expect(page).toHaveURL(new RegExp(`/users/${userId}/skills$`))
        await expect(
            page
                .getByText("No skills here")
                .or(page.getByRole("button", { name: /add skill/i })),
        ).toBeVisible()

        await profileTabs
            .getByRole("link", { name: "Languages", exact: true })
            .click()
        await expect(page).toHaveURL(new RegExp(`/users/${userId}/languages$`))
        await expect(page.getByText("Current languages")).toBeVisible()

        await profileTabs
            .getByRole("link", { name: "CVs", exact: true })
            .click()
        await expect(page).toHaveURL(new RegExp(`/users/${userId}/cv$`))
        await expect(page.getByRole("link", { name: "Name" })).toBeVisible()

        await profileTabs
            .getByRole("link", { name: "Profile", exact: true })
            .click()
        await expect(page).toHaveURL(new RegExp(`/users/${userId}/profile$`))
        await expect(firstNameInput).toBeEnabled()
        await expect(profileEmail).toBeVisible()
    })
})
