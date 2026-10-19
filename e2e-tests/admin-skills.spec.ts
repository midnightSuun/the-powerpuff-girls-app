import { expect, Page, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth"

async function navigateToSkills(page: Page) {
    await page.locator("a[href*='/skills']").first().click()
    await page.waitForURL(/.*\/skills/, { timeout: 10000 })
}

async function createSkill(page: Page, name: string) {
    await page.getByRole("button", { name: /CREATE SKILL/i }).click()

    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    const nameInput = modal.getByRole("textbox")
    await nameInput.fill(name)

    const categorySelect = modal.locator("[data-slot='select-trigger']")
    await categorySelect.click()

    const selectContent = page.locator(
        "[data-slot='select-content'][data-open]",
    )
    await expect(selectContent).toBeVisible({ timeout: 5000 })

    const firstOption = selectContent.locator("[role='option']").first()
    await firstOption.click()

    await expect(selectContent).not.toBeVisible({ timeout: 5000 })

    const createBtn = modal.getByRole("button", { name: /^CREATE SKILL$/i })
    await expect(createBtn).toBeEnabled({ timeout: 5000 })
    await createBtn.click()

    await expect(modal).not.toBeVisible({ timeout: 10000 })

    await expect(page.getByText(name, { exact: false }).first()).toBeVisible({
        timeout: 10000,
    })
}

test.describe("Skills (Admin)", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        await navigateToSkills(page)
    })

    test("should create a new skill", async ({ page }) => {
        const skillName = `Test Skill ${Date.now()}`

        await createSkill(page, skillName)

        await expect(
            page.getByText(skillName, { exact: false }).first(),
        ).toBeVisible({
            timeout: 10000,
        })
    })

    test("should edit skill name", async ({ page }) => {
        const skillName = `Test Skill ${Date.now()}`
        const updatedName = `Updated Skill ${Date.now()}`

        await createSkill(page, skillName)

        const skillRow = page
            .locator("tr")
            .filter({ hasText: skillName })
            .first()
        await expect(skillRow).toBeVisible({ timeout: 5000 })

        await skillRow
            .getByRole("button", { name: `Actions for ${skillName}` })
            .click()

        const editItem = page.getByRole("menuitem", { name: /^Edit$/i })
        await expect(editItem).toBeVisible({ timeout: 5000 })
        await editItem.click()

        const editModal = page.locator("[role='dialog']").first()
        await expect(editModal).toBeVisible({ timeout: 5000 })

        const nameInput = editModal.getByRole("textbox")
        await nameInput.fill(updatedName)

        const saveBtn = editModal.getByRole("button", { name: /^SAVE$/i })
        await expect(saveBtn).toBeEnabled({ timeout: 5000 })
        await saveBtn.click()

        await expect(editModal).not.toBeVisible({ timeout: 10000 })

        await expect(
            page.getByText(updatedName, { exact: false }).first(),
        ).toBeVisible({ timeout: 10000 })
    })

    test("should delete a skill", async ({ page }) => {
        const skillName = `Test Skill ${Date.now()}`

        await createSkill(page, skillName)

        await expect(
            page.getByText(skillName, { exact: false }).first(),
        ).toBeVisible({
            timeout: 10000,
        })

        const skillRow = page
            .locator("tr")
            .filter({ hasText: skillName })
            .first()
        await expect(skillRow).toBeVisible({ timeout: 5000 })

        await skillRow
            .getByRole("button", { name: `Actions for ${skillName}` })
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
            page.getByText(skillName, { exact: false }),
        ).not.toBeVisible({ timeout: 10000 })
    })
})
