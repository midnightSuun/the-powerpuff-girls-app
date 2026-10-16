import { expect, Page } from "@playwright/test"

export async function addProject(page: Page) {
    await page.getByRole("button", { name: /ADD PROJECT/i }).click()

    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    const projectSelect = modal.locator("[data-slot='select-trigger']").first()
    await projectSelect.click()

    const projectPopup = page.locator(
        "[data-slot='select-content'][data-open]",
    )
    await expect(projectPopup).toBeVisible({ timeout: 5000 })

    const projectOptions = projectPopup.locator("[role='option']")
    await projectOptions.first().click()
    await expect(projectPopup).not.toBeVisible({ timeout: 5000 })

    const rawProjectName = await projectSelect.textContent()
    const selectedProjectName = rawProjectName?.replace(/▼/g, "").trim()

    await page.waitForTimeout(1000)

    await modal.getByRole("button", { name: "Start date" }).click()
    await page.waitForTimeout(500)
    await page.getByText("5", { exact: true }).first().click()

    await modal.getByRole("button", { name: "End date" }).click()
    await page.waitForTimeout(500)
    await page.getByText("10", { exact: true }).first().click()

    const addButton = modal.getByRole("button", { name: /^ADD$/i })
    await expect(addButton).toBeEnabled({ timeout: 5000 })
    await addButton.click()

    await expect(modal).not.toBeVisible({ timeout: 10000 })

    return selectedProjectName || "Project"
}
