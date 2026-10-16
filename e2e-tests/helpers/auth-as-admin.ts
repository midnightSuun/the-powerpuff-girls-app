import { expect, Page } from "@playwright/test"

const getAdminCredentials = () => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@outlook.com"
    const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "123456789"

    return { adminEmail, adminPassword }
}

export async function loginAsAdmin(page: Page) {
    const { adminEmail, adminPassword } = getAdminCredentials()

    await page.goto("/login")
    await expect(page).toHaveURL(/.*login/)

    await page.fill('input[type="email"]', adminEmail)

    const passwordInput = page.locator('input[type="password"]').first()
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill(adminPassword)

    const submitButton = page.getByRole("button", {
        name: /sign in|login|войти|увійти|submit/i,
    })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    const signInError = page.getByRole("alert", {
        name: /failed to sign in/i,
    })
    await expect(signInError).toBeHidden({ timeout: 10_000 })
    await expect(page).toHaveURL(/.*users/, { timeout: 20_000 })

    return { adminEmail, adminPassword }
}
