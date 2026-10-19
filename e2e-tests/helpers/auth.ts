import { expect, Page } from "@playwright/test"

export async function registerAndSkipVerification(page: Page) {
    const uniqueEmail = `test.user.${Date.now()}@example.com`
    const password = "SecurePassword123!"

    await page.goto("/login")
    await expect(page).toHaveURL(/.*login/)

    const signupTab = page.locator('a[href="/register"]')
    await expect(signupTab).toBeVisible()
    await Promise.all([
        page.waitForURL(/.*register/, { timeout: 15000 }),
        signupTab.click(),
    ])
    await expect(page).toHaveURL(/.*register/)

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

    return { uniqueEmail, password }
}
