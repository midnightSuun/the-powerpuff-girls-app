import { expect, Page, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth"

async function navigateToLanguages(page: Page) {
    await page.locator("a[href*='/languages']").first().click()
    await page.waitForURL(/.*\/languages/, { timeout: 10000 })
}

async function createLanguage(page: Page, name: string) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const maxAttempts = 10

    await page.getByRole("button", { name: /CREATE LANGUAGE/i }).click()

    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    const inputs = modal.getByRole("textbox")
    await inputs.nth(0).fill(name)

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const iso2 =
            letters[Math.floor(Math.random() * 26)] +
            letters[Math.floor(Math.random() * 26)]

        await inputs.nth(1).fill(iso2)

        const createBtn = modal.getByRole("button", { name: /^CREATE$/i })
        await expect(createBtn).toBeEnabled({ timeout: 5000 })
        await createBtn.click()

        const closed = await modal
            .waitFor({ state: "hidden", timeout: 5000 })
            .then(() => true)
            .catch(() => false)

        if (closed) {
            await expect(
                page.getByText(name, { exact: false }).first(),
            ).toBeVisible({ timeout: 10000 })
            return
        }
    }

    throw new Error(
        `Failed to create language "${name}" after ${maxAttempts} attempts (ISO2 collisions)`,
    )
}

test.describe("Languages (Admin)", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        await navigateToLanguages(page)
    })

    test("should create a new language", async ({ page }) => {
        const languageName = `Test Language ${Date.now()}`

        await createLanguage(page, languageName)

        await expect(
            page.getByText(languageName, { exact: false }).first(),
        ).toBeVisible({
            timeout: 10000,
        })
    })

    test("should edit language name", async ({ page }) => {
        const ts = Date.now()
        const languageName = `Test Language ${ts}`
        const updatedName = `Updated Language ${ts}`

        await createLanguage(page, languageName)

        const languageRow = page
            .locator("tr")
            .filter({ hasText: languageName })
            .first()
        await expect(languageRow).toBeVisible({ timeout: 10000 })

        await languageRow
            .getByRole("button", { name: `Actions for ${languageName}` })
            .click()

        const editItem = page.getByRole("menuitem", { name: /^Edit$/i })
        await expect(editItem).toBeVisible({ timeout: 5000 })
        await editItem.click()

        const editModal = page.locator("[role='dialog']").first()
        await expect(editModal).toBeVisible({ timeout: 5000 })

        const nameInput = editModal.getByRole("textbox").first()
        await nameInput.clear()
        await nameInput.fill(updatedName)
        await expect(nameInput).toHaveValue(updatedName)

        const saveBtn = editModal.getByRole("button", { name: /^SAVE$/i })
        await expect(saveBtn).toBeEnabled({ timeout: 5000 })
        await saveBtn.click()

        await expect(editModal).not.toBeVisible({ timeout: 10000 })

        await expect(
            page.getByText(updatedName, { exact: false }).first(),
        ).toBeVisible({ timeout: 10000 })
    })

    test("should delete a language", async ({ page }) => {
        const languageName = `Test Language ${Date.now()}`

        await createLanguage(page, languageName)

        await expect(
            page.getByText(languageName, { exact: false }).first(),
        ).toBeVisible({
            timeout: 10000,
        })

        const languageRow = page
            .locator("tr")
            .filter({ hasText: languageName })
            .first()
        await expect(languageRow).toBeVisible({ timeout: 5000 })

        await languageRow
            .getByRole("button", { name: `Actions for ${languageName}` })
            .click()

        const deleteItem = page.getByRole("menuitem", { name: /^Delete$/i })
        await expect(deleteItem).toBeVisible({ timeout: 5000 })
        await deleteItem.click()

        const confirmModal = page.locator("[role='dialog']").first()
        await expect(confirmModal).toBeVisible({ timeout: 5000 })

        const confirmBtn = confirmModal.getByRole("button", {
            name: /(CONFIRM|DELETE)/i,
        })
        await confirmBtn.click()

        await expect(confirmModal).not.toBeVisible({ timeout: 10000 })

        await expect(
            page.getByText(languageName, { exact: false }),
        ).not.toBeVisible({ timeout: 10000 })
    })
})
