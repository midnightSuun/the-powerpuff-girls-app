import { expect, Page } from "@playwright/test"

async function pickSelectOption(
    page: Page,
    trigger: ReturnType<Page["locator"]>,
    optionIndex: number,
): Promise<string> {
    await trigger.click()

    const openPopup = page.locator("[data-slot='select-content'][data-open]")
    await expect(openPopup).toBeVisible({ timeout: 5000 })

    const option = openPopup.locator("[role='option']").nth(optionIndex)
    const text = (await option.textContent()) ?? ""
    await option.click()

    await expect(openPopup).not.toBeVisible({ timeout: 5000 })

    return text.trim()
}

export async function navigateToSkills(page: Page) {
    const skillsLink = page.locator("a[href*='/skills']").first()
    await expect(skillsLink).toBeVisible({ timeout: 10000 })
    await skillsLink.click()
    await page.waitForURL(/.*skills/, { timeout: 10000 })
}

export async function addSkill(page: Page): Promise<string> {
    const addButton = page.getByRole("button", { name: "ADD SKILL" })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()

    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    const openPopup = page.locator("[data-slot='select-content'][data-open]")
    const isAlreadyOpen = await openPopup.isVisible()

    let skillName: string
    if (isAlreadyOpen) {
        const option = openPopup.locator("[role='option']").first()
        skillName = (await option.textContent()) ?? "Skill"
        await option.click()
        await expect(openPopup).not.toBeVisible({ timeout: 5000 })
    } else {
        const skillTrigger = modal
            .locator("[data-slot='select-trigger']")
            .first()
        skillName = await pickSelectOption(page, skillTrigger, 0)
    }

    const masteryTrigger = modal.locator("[data-slot='select-trigger']").nth(1)
    await pickSelectOption(page, masteryTrigger, 0)

    const submitBtn = modal.getByRole("button", { name: "ADD" })
    await expect(submitBtn).toBeEnabled({ timeout: 5000 })
    await submitBtn.click()

    await expect(modal).not.toBeVisible({ timeout: 10000 })

    return skillName.trim()
}
