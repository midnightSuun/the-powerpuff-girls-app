import { expect, Page } from "@playwright/test"

async function pickFirstAvailableDay(
    page: Page,
    modal: ReturnType<Page["locator"]>,
    triggerIndex: number,
) {
    const trigger = modal
        .locator("button[aria-haspopup='dialog']")
        .nth(triggerIndex)
    await expect(trigger).toBeVisible({ timeout: 5000 })
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true", {
        timeout: 5000,
    })

    const dayButton = page
        .locator(
            "body > div[style*='position: fixed'] button[type='button']:not(:disabled)",
        )
        .filter({ hasText: /^\d{1,2}$/ })
        .first()
    await expect(dayButton).toBeVisible({ timeout: 5000 })
    await dayButton.click()

    await expect(trigger).toHaveAttribute("aria-expanded", "false", {
        timeout: 5000,
    })
}

export async function addProject(page: Page) {
    await page.getByRole("button", { name: /ADD PROJECT/i }).click()

    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    const projectSelect = modal.locator("[data-slot='select-trigger']").first()
    await projectSelect.click()

    const projectPopup = page.locator("[data-slot='select-content'][data-open]")
    await expect(projectPopup).toBeVisible({ timeout: 5000 })

    const firstOption = projectPopup.locator("[role='option']").first()
    const selectedProjectName = ((await firstOption.textContent()) ?? "").trim()
    await firstOption.click()
    await expect(projectPopup).not.toBeVisible({ timeout: 5000 })

    await pickFirstAvailableDay(page, modal, 0)
    await pickFirstAvailableDay(page, modal, 1)

    const addButton = modal.getByRole("button", { name: /^ADD$/i })
    await expect(addButton).toBeEnabled({ timeout: 5000 })
    await addButton.click()

    await expect(modal).not.toBeVisible({ timeout: 10000 })

    return selectedProjectName || "Project"
}
