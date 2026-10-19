import { expect, Page, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth"

async function navigateToProjects(page: Page) {
    await page.locator("a[href*='/projects']").first().click()
    await page.waitForURL(/.*\/projects/, { timeout: 10000 })
}

async function pickDate(
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

async function createProject(
    page: Page,
    data: {
        name: string
        domain: string
        description: string
    },
) {
    await page.getByRole("button", { name: /CREATE PROJECT/i }).click()

    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    await modal.getByPlaceholder(/^Name$/i).fill(data.name)
    await modal.getByPlaceholder(/^Domain$/i).fill(data.domain)
    await modal.getByPlaceholder(/^Description$/i).fill(data.description)

    await pickDate(page, modal, 0)

    await pickDate(page, modal, 1)

    const envTrigger = modal.locator('button[aria-haspopup="listbox"]').last()
    await envTrigger.click()

    await page.waitForTimeout(500)

    const optionCount = await page
        .locator('[role="listbox"]')
        .getByRole("option")
        .count()

    if (optionCount > 0) {
        const firstOption = page
            .locator('[role="listbox"]')
            .getByRole("option")
            .first()
        await firstOption.click()
        await page.waitForTimeout(200)

        if (optionCount > 1) {
            const secondOption = page
                .locator('[role="listbox"]')
                .getByRole("option")
                .nth(1)
            await secondOption.click()
            await page.waitForTimeout(200)
        }
    }

    await page.keyboard.press("Escape")

    const createBtn = modal.getByRole("button", { name: /^CREATE$/i })
    await expect(createBtn).toBeEnabled({ timeout: 5000 })
    await createBtn.click()

    await expect(modal).not.toBeVisible({ timeout: 10000 })

    await expect(page.getByText(data.name, { exact: false })).toBeVisible({
        timeout: 10000,
    })
}

test.describe("Projects (Admin)", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        await navigateToProjects(page)
    })

    test("should create a new project with all required fields", async ({
        page,
    }) => {
        const projectName = `Test Project ${Date.now()}`
        const projectData = {
            name: projectName,
            domain: "E-commerce",
            description: "Test project for automated testing",
        }

        await createProject(page, projectData)

        await expect(page.getByText(projectName, { exact: false })).toBeVisible(
            {
                timeout: 10000,
            },
        )
    })

    test("should create a second project", async ({ page }) => {
        const projectName = `Second Project ${Date.now()}`
        const projectData = {
            name: projectName,
            domain: "Healthcare",
            description: "Second test project",
        }

        await createProject(page, projectData)

        await expect(page.getByText(projectName, { exact: false })).toBeVisible(
            {
                timeout: 10000,
            },
        )
    })

    test("should edit project details", async ({ page }) => {
        const projectName = `Test Project ${Date.now()}`
        const updatedName = `Updated Project ${Date.now()}`

        await createProject(page, {
            name: projectName,
            domain: "Finance",
            description: "Original description",
        })

        const projectRow = page
            .locator("tr")
            .filter({ hasText: projectName })
            .first()
        await expect(projectRow).toBeVisible({ timeout: 5000 })

        await projectRow
            .getByRole("button", { name: `Actions for ${projectName}` })
            .click()

        await page.getByRole("menuitem", { name: /Edit/i }).click()

        const editModal = page.locator("[role='dialog']").first()
        await expect(editModal).toBeVisible({ timeout: 5000 })

        await page.waitForTimeout(500)

        const nameInput = editModal.locator(`input[value="${projectName}"]`)
        await expect(nameInput).toBeVisible({ timeout: 5000 })

        await nameInput.click()
        await nameInput.press("Control+A")
        await nameInput.type(updatedName)

        const domainInput = editModal.locator(`input[value="Finance"]`)
        await expect(domainInput).toBeVisible({ timeout: 5000 })
        await domainInput.click()
        await domainInput.press("Control+A")
        await domainInput.type("Updated Domain")

        const updateBtn = editModal.getByRole("button", { name: /^UPDATE$/i })
        await expect(updateBtn).toBeEnabled({ timeout: 5000 })
        await updateBtn.click()

        await expect(editModal).not.toBeVisible({ timeout: 10000 })

        await expect(page.getByText(updatedName, { exact: false })).toBeVisible(
            { timeout: 10000 },
        )
    })

    test("should delete a project", async ({ page }) => {
        const projectName = `Test Project ${Date.now()}`

        await createProject(page, {
            name: projectName,
            domain: "Education",
            description: "Project to be deleted",
        })

        await expect(page.getByText(projectName, { exact: false })).toBeVisible(
            {
                timeout: 10000,
            },
        )

        const projectRow = page
            .locator("tr")
            .filter({ hasText: projectName })
            .first()
        await expect(projectRow).toBeVisible({ timeout: 5000 })

        await projectRow
            .getByRole("button", { name: `Actions for ${projectName}` })
            .click()

        const deleteMenuItem = page
            .getByRole("menuitem")
            .filter({ hasText: /Remove|Delete/i })
        await expect(deleteMenuItem).toBeVisible({ timeout: 5000 })
        await deleteMenuItem.click()

        const confirmModal = page.locator("[role='dialog']").first()
        await expect(confirmModal).toBeVisible({ timeout: 5000 })

        const confirmBtn = confirmModal.getByRole("button", {
            name: /(CONFIRM|DELETE|REMOVE)/i,
        })
        await confirmBtn.click()

        await expect(confirmModal).not.toBeVisible({ timeout: 10000 })

        await expect(
            page.getByText(projectName, { exact: false }),
        ).not.toBeVisible({ timeout: 10000 })
    })

    test("should validate required fields", async ({ page }) => {
        await page.getByRole("button", { name: /CREATE PROJECT/i }).click()

        const modal = page.locator("[role='dialog']").first()
        await expect(modal).toBeVisible({ timeout: 5000 })

        const createBtn = modal.getByRole("button", { name: /^CREATE$/i })

        await expect(createBtn).toBeDisabled()
    })
})
