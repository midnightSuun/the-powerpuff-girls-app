import { expect, Page, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth"

async function navigateToPositions(page: Page) {
    await page.locator("a[href*='/positions']").first().click()
    await page.waitForURL(/.*\/positions/, { timeout: 10000 })
}

async function createPosition(page: Page, name: string) {
    await page.getByRole("button", { name: /CREATE POSITION/i }).click()

    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    await modal.getByPlaceholder("Position name").fill(name)

    await modal.getByRole("button", { name: /^CREATE$/i }).click()
    await expect(modal).not.toBeVisible({ timeout: 10000 })

    await expect(page.getByText(name, { exact: false })).toBeVisible({
        timeout: 10000,
    })
}

test.describe("Positions (Admin)", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        await navigateToPositions(page)
    })

    test("should create a new position", async ({ page }) => {
        const positionName = `Test Position ${Date.now()}`

        await createPosition(page, positionName)

        await expect(
            page.getByText(positionName, { exact: false }),
        ).toBeVisible({
            timeout: 10000,
        })
    })

    test("should edit position name", async ({ page }) => {
        const positionName = `Test Position ${Date.now()}`
        const updatedName = `Updated Position ${Date.now()}`

        await createPosition(page, positionName)

        const positionRow = page
            .locator("tr")
            .filter({ hasText: positionName })
            .first()
        await expect(positionRow).toBeVisible({ timeout: 5000 })

        await positionRow.locator("button").click()

        await positionRow.getByRole("button", { name: /^Edit$/i }).click()

        const editModal = page.locator("[role='dialog']").first()
        await expect(editModal).toBeVisible({ timeout: 5000 })

        const nameInput = editModal.getByPlaceholder("Position name")
        await nameInput.fill(updatedName)

        const saveBtn = editModal.getByRole("button", { name: /^SAVE$/i })
        await expect(saveBtn).toBeEnabled({ timeout: 5000 })
        await saveBtn.click()

        await expect(editModal).not.toBeVisible({ timeout: 10000 })

        await expect(page.getByText(updatedName, { exact: false })).toBeVisible(
            { timeout: 10000 },
        )
    })

    test("should delete a position", async ({ page }) => {
        const positionName = `Test Position ${Date.now()}`

        await createPosition(page, positionName)

        await expect(
            page.getByText(positionName, { exact: false }),
        ).toBeVisible({
            timeout: 10000,
        })

        const positionRow = page
            .locator("tr")
            .filter({ hasText: positionName })
            .first()
        await expect(positionRow).toBeVisible({ timeout: 5000 })

        await positionRow.locator("button").click()

        await positionRow.getByRole("button", { name: /^Delete$/i }).click()

        const confirmModal = page.locator("[role='dialog']").first()
        await expect(confirmModal).toBeVisible({ timeout: 5000 })

        const confirmBtn = confirmModal.getByRole("button", {
            name: /(CONFIRM|DELETE)/i,
        })
        await confirmBtn.click()

        await expect(confirmModal).not.toBeVisible({ timeout: 10000 })

        await expect(
            page.getByText(positionName, { exact: false }),
        ).not.toBeVisible({ timeout: 10000 })
    })
})
