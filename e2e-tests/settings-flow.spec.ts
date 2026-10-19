import { expect, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"

test.describe("Settings Page Comprehensive Flow", () => {
    test("should allow navigating to settings, changing theme, updating password, and changing language", async ({
        page,
    }) => {
        const { uniqueEmail } = await registerAndSkipVerification(page)

        const sidebarUserTrigger = page
            .locator(
                `button[aria-label*="${uniqueEmail}"], [data-slot="dropdown-menu-trigger"], button[data-slot="sidebar-menu-button"]`,
            )
            .first()
        await expect(sidebarUserTrigger).toBeVisible({ timeout: 10000 })
        await sidebarUserTrigger.click()

        const settingsMenuItem = page
            .locator('[role="menuitem"], [data-slot="dropdown-menu-item"], a')
            .filter({ hasText: /settings|настройки/i })
            .first()
        await expect(settingsMenuItem).toBeVisible({ timeout: 5000 })
        await settingsMenuItem.click()

        await page.waitForURL(/.*settings/, { timeout: 10000 })
        await expect(page).toHaveURL(/.*settings/)

        const themeSelectTrigger = page
            .locator("button[role='combobox']")
            .first()
        await expect(themeSelectTrigger).toBeVisible()
        await themeSelectTrigger.click()

        const darkThemeOption = page.getByRole("option", {
            name: /dark|темная/i,
        })
        await expect(darkThemeOption).toBeVisible()
        await darkThemeOption.click()

        const htmlElement = page.locator("html")
        await expect(htmlElement).toHaveClass(/dark/)

        const currentPasswordInput = page
            .locator("input[name='password']")
            .first()
        await expect(currentPasswordInput).toBeVisible()
        await currentPasswordInput.fill("OldPassword123!")

        const newPasswordInput = page
            .locator("input[name='newPassword']")
            .first()
        await expect(newPasswordInput).toBeVisible()
        await newPasswordInput.fill("NewSecurePassword456!")

        const confirmPasswordInput = page
            .locator("input[name='confirmPassword']")
            .first()
        await expect(confirmPasswordInput).toBeVisible()
        await confirmPasswordInput.fill("NewSecurePassword456!")

        const passwordSubmitButton = page
            .locator("main form button[type='submit']")
            .filter({ hasNotText: /sign in|войти/i })
            .first()

        await expect(passwordSubmitButton).toBeEnabled({ timeout: 10000 })
        await passwordSubmitButton.click()

        const languageSelectTrigger = page
            .locator("button[role='combobox']")
            .nth(1)
        await expect(languageSelectTrigger).toBeVisible()
        await languageSelectTrigger.click()

        const languageOption = page.getByRole("option", {
            name: /french|французский|français/i,
        })
        await expect(languageOption).toBeVisible()
        await languageOption.click()

        await page.waitForURL(/.fr\/settings/, { timeout: 10000 })
        await expect(page).toHaveURL(/.fr\/settings/)
    })
})
