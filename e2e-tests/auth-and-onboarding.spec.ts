import { expect, test } from "@playwright/test"

test.describe("Authentication and Onboarding Flow", () => {
    test("should allow user to register, view email verification, proceed via 'later', and reach users list", async ({
        page,
    }) => {
        await page.goto("/login")
        await expect(page).toHaveURL(/.*login/)

        const signupTab = page.locator('a[href="/register"]')
        await expect(signupTab).toBeVisible()
        await signupTab.click()
        await expect(page).toHaveURL(/.*register/)

        const uniqueEmail = `test.user.${Date.now()}@example.com`
        const password = "SecurePassword123!"

        await page.fill('input[type="email"]', uniqueEmail)

        const passwordInputs = page.locator('input[type="password"]')
        await passwordInputs.nth(0).fill(password)
        await passwordInputs.nth(1).fill(password)

        const submitButton = page.getByRole("button", {
            name: /create account|signup|register|зарегистрироваться/i,
        })
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        const laterButton = page.getByRole("button", { name: /later|позже/i })
        await expect(laterButton).toBeVisible({ timeout: 10000 })

        await laterButton.click()

        await page.waitForURL(/.*users/, { timeout: 10000 })
        await expect(page).toHaveURL(/.*users/)

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
