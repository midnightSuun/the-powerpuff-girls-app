import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth-as-admin"

test.describe("Admin Flow", () => {
    test("should allow admin authentication", async ({ page }) => {
        await loginAsAdmin(page)

        await expect(page).toHaveURL(/.*users/)
        const usersTable = page.locator("table, [role='table']").first()
        await expect(usersTable).toBeVisible()

        const createUserButton = page
            .locator("button")
            .filter({ hasText: /create user|создать пользователя|add user/i })
            .first()

        await expect(createUserButton).toBeVisible({ timeout: 10000 })
        await expect(createUserButton).toBeEnabled()
    })
})
