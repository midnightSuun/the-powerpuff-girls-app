import { expect, type Locator, type Page, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth-as-admin"

const selectDialogOption = async (
    page: Page,
    dialog: Locator,
    triggerIndex: number,
    optionIndex: number,
) => {
    await dialog
        .locator("[data-slot='select-trigger']")
        .nth(triggerIndex)
        .click()

    const selectContent = page.locator(
        "[data-slot='select-content'][data-open]",
    )
    await expect(selectContent).toBeVisible({ timeout: 5000 })
    await selectContent.locator("[role='option']").nth(optionIndex).click()
    await expect(selectContent).not.toBeVisible({ timeout: 5000 })
}

test.describe("Admin User CRUD Flow", () => {
    test("should allow admin to create a new user, navigate via pagination, update user details, and delete the user", async ({
        page,
    }) => {
        test.setTimeout(60_000)

        await loginAsAdmin(page)

        await expect(page).toHaveURL(/.*users/)
        const usersTable = page.locator("table, [role='table']").first()
        await expect(usersTable).toBeVisible()

        const uniqueEmail = `user.test.${Date.now()}@example.com`
        const password = "Password123!"
        const firstName = "John"
        const lastName = "Doe"

        const createUserTriggerButton = page
            .locator("button")
            .filter({ hasText: /create user|создать пользователя|add user/i })
            .first()
        await expect(createUserTriggerButton).toBeVisible()
        await createUserTriggerButton.click()

        const dialog = page.locator("[role='dialog']")
        await expect(dialog).toBeVisible()

        const emailInput = dialog.locator("input[type='email']")
        await expect(emailInput).toBeVisible()
        await emailInput.fill(uniqueEmail)

        const passwordInput = dialog.locator("input[type='password']")
        await passwordInput.fill(password)

        const textInputs = dialog.locator("input[type='text']")
        await textInputs.nth(0).fill(firstName)
        await textInputs.nth(1).fill(lastName)

        await selectDialogOption(page, dialog, 0, 1)
        await selectDialogOption(page, dialog, 1, 1)
        await selectDialogOption(page, dialog, 2, 1)

        const submitButton = dialog.locator("button[type='submit']")
        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        await expect(dialog).not.toBeVisible({ timeout: 15000 })

        const searchInput = page.locator('input[type="search"]').first()
        await expect(searchInput).toBeVisible({ timeout: 10000 })
        await searchInput.fill(uniqueEmail)
        await page.waitForURL(/search=/, { timeout: 10000 })
        await page.waitForLoadState("networkidle")

        const userRow = page
            .locator("tr, [role='row']")
            .filter({ hasText: uniqueEmail })
        await expect(userRow).toBeVisible({ timeout: 15000 })

        const actionsMenuButton = userRow.locator("button").last()
        await expect(actionsMenuButton).toBeVisible()
        await actionsMenuButton.click()

        const updateMenuItem = page.locator("[role='menuitem']").nth(1)
        await expect(updateMenuItem).toBeVisible()
        await updateMenuItem.click()

        const editDialog = page.locator("[role='dialog']")
        await expect(editDialog).toBeVisible({ timeout: 10000 })

        const updateFirstNameInput = editDialog.getByRole("textbox", {
            name: "First Name",
        })
        await expect(updateFirstNameInput).toBeVisible()
        await updateFirstNameInput.fill("UpdatedJohn")
        await expect(updateFirstNameInput).toHaveValue("UpdatedJohn")

        const saveButton = editDialog.locator("button[type='submit']")
        await expect(saveButton).toBeEnabled()
        await saveButton.click()

        await expect(editDialog).not.toBeVisible({ timeout: 15000 })
        await expect(
            page
                .getByRole("region", { name: /notifications/i })
                .getByText("Changes saved successfully."),
        ).toBeVisible({ timeout: 15000 })

        await expect(usersTable).toContainText("UpdatedJohn", {
            timeout: 15000,
        })

        const updatedUserRow = page
            .locator("tr, [role='row']")
            .filter({ hasText: uniqueEmail })

        const updatedActionsMenuButton = updatedUserRow.locator("button").last()
        await expect(updatedActionsMenuButton).toBeVisible()
        await updatedActionsMenuButton.click()

        const deleteMenuItem = page.locator("[role='menuitem']").nth(2)
        await expect(deleteMenuItem).toBeVisible()
        await deleteMenuItem.click()

        const confirmDeleteButton = page
            .locator("[role='dialog'] button")
            .filter({ hasText: /confirm|удалить|yes/i })
        await expect(confirmDeleteButton).toBeVisible({ timeout: 5000 })
        await confirmDeleteButton.click()

        await expect(updatedUserRow).not.toBeVisible({ timeout: 10000 })
    })
})
