import { expect, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"

test.describe("Languages Page Management Flow", () => {
    test("should allow registered user to navigate to languages, add, edit, and delete a language", async ({
        page,
    }) => {
        await registerAndSkipVerification(page)

        const languagesNavLink = page
            .getByRole("link", { name: /языки|languages/i })
            .first()
        await expect(languagesNavLink).toBeVisible()
        await languagesNavLink.click()

        await page.waitForURL(/.*languages/, { timeout: 10000 })
        await expect(page).toHaveURL(/.*languages/)

        const emptyStateText = page.getByText(
            /no languages added yet|языки еще не добавлены/i,
        )
        await expect(emptyStateText).toBeVisible()

        const addLanguageButton = page.getByRole("button", {
            name: /add language|добавить язык/i,
        })
        await expect(addLanguageButton).toBeVisible()
        await addLanguageButton.click()

        const languageSelectTrigger = page
            .locator("button[role='combobox']")
            .first()
        await expect(languageSelectTrigger).toBeVisible()
        await languageSelectTrigger.click()

        const englishOption = page.getByRole("option", { name: /english/i })
        await expect(englishOption).toBeVisible()
        await englishOption.click()

        const proficiencySelectTrigger = page
            .locator("button[role='combobox']")
            .nth(1)
        await proficiencySelectTrigger.click()

        const proficiencyOption = page.getByRole("option", {
            name: "B1 - Intermediate",
            exact: true,
        })
        await expect(proficiencyOption).toBeVisible()
        await proficiencyOption.click()

        const submitAddButton = page
            .getByRole("dialog")
            .getByRole("button", { name: /^add$|^добавить$/i })
        await submitAddButton.click()

        await expect(page.getByRole("dialog")).not.toBeVisible({
            timeout: 10000,
        })

        const mainContainer = page.getByRole("main")
        const addedLanguageItem = mainContainer
            .locator("button")
            .filter({ hasText: "English" })
            .first()
        await expect(addedLanguageItem).toBeVisible({ timeout: 10000 })

        await addedLanguageItem.click()

        const editModalTitle = page.getByText(
            /edit language|update language|редактировать язык|обновить язык/i,
        )
        if (
            await editModalTitle.isVisible({ timeout: 4000 }).catch(() => false)
        ) {
            const editDialog = page.getByRole("dialog")
            const editProficiencyTrigger = editDialog
                .locator("button[role='combobox']:not([disabled])")
                .first()
            await expect(editProficiencyTrigger).toBeVisible({ timeout: 5000 })
            await editProficiencyTrigger.click()

            const newProficiencyOption = page.getByRole("option", {
                name: "C1 - Advanced",
                exact: true,
            })
            await expect(newProficiencyOption).toBeVisible()
            await newProficiencyOption.click()

            const saveButton = editDialog.getByRole("button", {
                name: /^update$|^save$|^сохранить$|^обновить$/i,
            })
            await saveButton.click()

            await expect(editDialog).not.toBeVisible({ timeout: 10000 })
        }

        const removeLanguagesButton = page.getByRole("button", {
            name: /remove languages|удалить языки/i,
        })

        await expect(removeLanguagesButton).toBeEnabled({ timeout: 10000 })
        await removeLanguagesButton.click()

        await addedLanguageItem.click()
        await expect(addedLanguageItem).toHaveAttribute(
            "aria-pressed",
            "true",
            { timeout: 5000 },
        )

        const deleteSelectedButton = page
            .locator("button")
            .filter({ hasText: /delete \(\d+\)|удалить \(\d+\)/i })
        await expect(deleteSelectedButton).toBeEnabled({ timeout: 5000 })
        await deleteSelectedButton.click()

        const confirmDeleteButton = page
            .getByRole("button", { name: /confirm|подтвердить|удалить|yes/i })
            .last()
        await expect(confirmDeleteButton).toBeVisible()
        await confirmDeleteButton.click()

        await expect(emptyStateText).toBeVisible({ timeout: 10000 })
    })
})
