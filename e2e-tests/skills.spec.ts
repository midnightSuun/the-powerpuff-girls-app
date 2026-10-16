import { expect, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"
import { addSkill, navigateToSkills } from "./helpers/skills"

test.describe("Skills - add, update, delete", () => {
    test.beforeEach(async ({ page }) => {
        await registerAndSkipVerification(page)
        await navigateToSkills(page)
    })

    test("should add a skill with mastery level", async ({ page }) => {
        const skillName = await addSkill(page)

        await expect(
            page.getByText(skillName, { exact: false }),
        ).toBeVisible({ timeout: 10000 })
    })

    test("should update mastery of an existing skill", async ({ page }) => {
        const skillName = await addSkill(page)

        await page.getByRole("button", { name: `Edit ${skillName}` }).click()

        const editModal = page.locator("[role='dialog']").first()
        await expect(editModal).toBeVisible({ timeout: 5000 })

        const masteryTrigger = editModal
            .locator("[data-slot='select-trigger']:not([disabled])")
            .first()
        await masteryTrigger.click()

        const openPopup = page.locator(
            "[data-slot='select-content'][data-open]",
        )
        await expect(openPopup).toBeVisible({ timeout: 5000 })

        const options = openPopup.locator("[role='option']")
        const count = await options.count()

        await options.nth(count - 1).click()

        await expect(openPopup).not.toBeVisible({ timeout: 5000 })

        const updateBtn = editModal.getByRole("button", { name: "UPDATE" })
        await expect(updateBtn).toBeEnabled({ timeout: 5000 })
        await updateBtn.click()

        await expect(editModal).not.toBeVisible({ timeout: 10000 })

        const redBar = page.locator(".bg-red-600").first()
        await expect(redBar).toBeVisible({ timeout: 10000 })
    })

    test("should delete a skill via selection mode", async ({ page }) => {
        const skillName = await addSkill(page)


        await expect(page.getByText(skillName, { exact: false })).toBeVisible({
            timeout: 10000,
        })


        await page.getByRole("button", { name: "REMOVE SKILLS" }).click()


        await page.getByRole("button", { name: `Select ${skillName}` }).click()

        const selectedSkill = page.locator(".ring-red-500").first()
        await expect(selectedSkill).toBeVisible({ timeout: 5000 })


        const deleteBtn = page.getByRole("button", { name: /DELETE \(\d+\)/i })
        await expect(deleteBtn).toBeVisible({ timeout: 5000 })
        await deleteBtn.click()

        const confirmModal = page.locator("[role='dialog']").first()
        await expect(confirmModal).toBeVisible({ timeout: 5000 })

        await confirmModal.getByRole("button", { name: "CONFIRM" }).click()

        await expect(confirmModal).not.toBeVisible({ timeout: 10000 })


        await expect(
            page.getByText(skillName, { exact: false }),
        ).not.toBeVisible({ timeout: 10000 })
    })
})
