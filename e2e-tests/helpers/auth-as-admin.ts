import { expect, Page } from "@playwright/test"

export async function loginAsAdmin(page: Page) {
    const adminEmail = "admin@outlook.com"
    const adminPassword = "123456789"

    await page.goto("/login")
    await expect(page).toHaveURL(/.*login/)

    await page.fill('input[type="email"]', adminEmail)

    const passwordInput = page.locator('input[type="password"]').first()
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill(adminPassword)

    const submitButton = page.getByRole("button", {
        name: /sign in|login|войти|submit/i,
    })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    await page.waitForURL(/.*users/, { timeout: 10000 })
    await expect(page).toHaveURL(/.*users/)

    return { adminEmail, adminPassword }
}
