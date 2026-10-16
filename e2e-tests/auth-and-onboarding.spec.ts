import { expect, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"

test.describe("Authentication and Onboarding Flow", () => {
    test("should allow user to register, view email verification, proceed via 'later', reach users list, and logout", async ({
        page,
    }) => {
        const { uniqueEmail } = await registerAndSkipVerification(page)

        const usersTable = page.locator("table, [role='table']").first()
        await expect(usersTable).toBeVisible()

        const sidebarUserTrigger = page
            .locator(
                `button[aria-label*="${uniqueEmail}"], [data-slot="dropdown-menu-trigger"], button[data-slot="sidebar-menu-button"]`,
            )
            .first()
        await expect(sidebarUserTrigger).toBeVisible({ timeout: 10000 })
        await sidebarUserTrigger.click()

        const logoutButton = page
            .locator(
                '[role="menuitem"], [data-slot="dropdown-menu-item"], button',
            )
            .filter({ hasText: /log out|logout|выйти/i })
            .first()
        await expect(logoutButton).toBeVisible({ timeout: 5000 })
        await logoutButton.click()

        await page.waitForURL(/.*login/, { timeout: 10000 })
        await expect(page).toHaveURL(/.*login/)
    })
})
