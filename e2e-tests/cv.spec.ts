import { expect, Page, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"
import { addProject } from "./helpers/projects"
import { addSkill } from "./helpers/skills"

async function navigateToCv(page: Page) {
    await page.locator("a[href*='/cv']").first().click()
    await page.waitForURL(/.*\/cv/, { timeout: 10000 })
}

async function createCv(
    page: Page,
    name: string,
    education: string,
    description: string,
) {
    await page.getByRole("button", { name: /CREATE CV/i }).click()
    const modal = page.locator("[role='dialog']").first()
    await expect(modal).toBeVisible({ timeout: 5000 })
    await modal.getByLabel("Name").fill(name)
    await modal.getByLabel("Education").fill(education)
    await modal.getByPlaceholder("Description").fill(description)
    await modal.getByRole("button", { name: /^CREATE$/i }).click()
    await expect(modal).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(name, { exact: false })).toBeVisible({
        timeout: 10000,
    })
}

async function openCvView(page: Page, cvName: string) {
    const cvRow = page
        .locator("div.group")
        .filter({ hasText: cvName })
        .first()
    await expect(cvRow).toBeVisible({ timeout: 5000 })
    await cvRow.getByRole("button").first().click()
    const viewBtn = cvRow.getByRole("button", { name: /^View$/i })
    await expect(viewBtn).toBeVisible({ timeout: 3000 })
    await viewBtn.click()
    await page.waitForURL(/\/cv\/\d+/, { timeout: 10000 })
}

test.describe("CV", () => {
    test.describe.configure({ mode: "serial" })

    test.beforeEach(async ({ page }) => {
        await registerAndSkipVerification(page)
        await navigateToCv(page)
    })

    test.describe("CV list", () => {
        test("should create a new CV and see it in the list", async ({
            page,
        }) => {
            const cvName = `Test CV ${Date.now()}`

            await createCv(
                page,
                cvName,
                "Bachelor of Computer Science",
                "Senior fullstack developer with 5 years experience",
            )

            await expect(
                page.getByText(cvName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })
        })

        test("should edit CV name from list", async ({ page }) => {
            const cvName = `Test CV ${Date.now()}`
            const updatedName = `Updated CV ${Date.now()}`

            await createCv(
                page,
                cvName,
                "Bachelor of Computer Science",
                "Senior fullstack developer",
            )

            const cvRow = page
                .locator("div.group")
                .filter({ hasText: cvName })
                .first()
            await expect(cvRow).toBeVisible({ timeout: 5000 })

            await cvRow.getByRole("button").first().click()
            await cvRow.getByRole("button", { name: /^Edit$/i }).click()

            const editModal = page.locator("[role='dialog']").first()
            await expect(editModal).toBeVisible({ timeout: 5000 })

            const nameInput = editModal.getByLabel("Name")
            await nameInput.focus()
            await page.keyboard.press("Control+A")
            await page.keyboard.type(updatedName)

            const saveBtn = editModal.getByRole("button", { name: /^SAVE$/i })
            await expect(saveBtn).toBeEnabled({ timeout: 5000 })
            await saveBtn.click()

            await expect(editModal).not.toBeVisible({ timeout: 10000 })

            await expect(
                page.getByText(updatedName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })
        })

        test("should delete CV from list", async ({ page }) => {
            const cvName = `Test CV ${Date.now()}`

            await createCv(
                page,
                cvName,
                "Bachelor of Computer Science",
                "Senior fullstack developer",
            )

            await expect(
                page.getByText(cvName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })

            const cvRow = page
                .locator("div.group")
                .filter({ hasText: cvName })
                .first()
            await expect(cvRow).toBeVisible({ timeout: 5000 })

            await cvRow.getByRole("button").first().click()
            await cvRow.getByRole("button", { name: /^Delete$/i }).click()

            const confirmModal = page.locator("[role='dialog']").first()
            await expect(confirmModal).toBeVisible({ timeout: 5000 })

            const confirmBtn = confirmModal.getByRole("button", { name: /(CONFIRM|DELETE|Remove)/i })
            await confirmBtn.click()

            await expect(confirmModal).not.toBeVisible({ timeout: 10000 })

            await expect(
                page.getByText(cvName, { exact: false }),
            ).not.toBeVisible({ timeout: 10000 })
        })
    })

    test.describe("CV details", () => {
        test("should open CV via View and update its name", async ({
            page,
        }) => {
            const cvName = `Test CV ${Date.now()}`
            const updatedName = `Updated CV ${Date.now()}`

            await createCv(page, cvName, "BSc Computer Science", "Some description")
            await openCvView(page, cvName)

            const nameInput = page.getByRole("textbox", { name: "Name" })
            await expect(nameInput).toBeVisible({ timeout: 5000 })
            await nameInput.focus()
            await page.keyboard.press("Control+A")
            await page.keyboard.type(updatedName)

            const updateBtn = page.getByRole("button", { name: /^UPDATE$/i })
            await expect(updateBtn).toBeEnabled({ timeout: 5000 })
            await updateBtn.click()

            await expect(
                page.getByRole("region", { name: /notifications/i }).locator("li").first(),
            ).toBeVisible({ timeout: 10000 })
        })
    })

    test.describe("CV skills", () => {
        test.beforeEach(async ({ page }) => {
            const cvName = `Test CV ${Date.now()}`
            await createCv(page, cvName, "BSc Computer Science", "Some description")
            await openCvView(page, cvName)
            await page.locator("a[href*='/cv/'][href$='/skills']").click()
            await page.waitForURL(/\/cv\/\d+\/skills/, { timeout: 15000 })
        })

        test("should add a skill to CV", async ({ page }) => {
            const skillName = await addSkill(page)

            await expect(
                page.getByText(skillName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })
        })

        test("should update mastery of a CV skill", async ({ page }) => {
            const skillName = await addSkill(page)

            await page
                .getByRole("button", { name: `Edit ${skillName}` })
                .click()

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
            await options.nth((await options.count()) - 1).click()

            await expect(openPopup).not.toBeVisible({ timeout: 5000 })

            await editModal.getByRole("button", { name: "UPDATE" }).click()
            await expect(editModal).not.toBeVisible({ timeout: 10000 })

            await expect(page.locator(".bg-red-600").first()).toBeVisible({
                timeout: 10000,
            })
        })

        test("should delete a CV skill via selection mode", async ({
            page,
        }) => {
            const skillName = await addSkill(page)

            await expect(
                page.getByText(skillName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })

            await page.getByRole("button", { name: "REMOVE SKILLS" }).click()


            await page
                .getByRole("button", { name: `Select ${skillName}` })
                .click()

            await expect(page.locator(".ring-red-500").first()).toBeVisible({
                timeout: 5000,
            })

            await page
                .getByRole("button", { name: /DELETE \(\d+\)/i })
                .click()

            const confirmModal = page.locator("[role='dialog']").first()
            await expect(confirmModal).toBeVisible({ timeout: 5000 })
            await confirmModal
                .getByRole("button", { name: "CONFIRM" })
                .click()
            await expect(confirmModal).not.toBeVisible({ timeout: 10000 })

            await expect(
                page.getByText(skillName, { exact: false }),
            ).not.toBeVisible({ timeout: 10000 })
        })
    })

    test.describe("CV projects", () => {
        test.beforeEach(async ({ page }) => {
            const cvName = `Test CV ${Date.now()}`
            await createCv(page, cvName, "BSc Computer Science", "Some description")
            await openCvView(page, cvName)
            await page.locator("a[href*='/cv/'][href$='/projects']").click()
            await page.waitForURL(/\/cv\/\d+\/projects/, { timeout: 15000 })
        })

        test("should add a project to CV", async ({ page }) => {
            const projectName = await addProject(page)

            await expect(
                page.getByText(projectName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })
        })

        test("should edit project dates", async ({ page }) => {
            const projectName = await addProject(page)

            await expect(
                page.getByText(projectName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })

            await page
                .getByRole("button", { name: `Actions for ${projectName}` })
                .click()

            await page.getByRole("menuitem", { name: "Edit" }).click()

            const editModal = page.locator("[role='dialog']").first()
            await expect(editModal).toBeVisible({ timeout: 5000 })

            await editModal.getByRole("button", { name: /^\d{1,2}\/\d{1,2}\/\d{4}$/ }).first().click()
            await page.waitForTimeout(500)

            await page.getByText("20", { exact: true }).first().click()

            const updateBtn = editModal.getByRole("button", { name: /^UPDATE$/i })
            await expect(updateBtn).toBeEnabled({ timeout: 5000 })
            await updateBtn.click()

            await expect(editModal).not.toBeVisible({ timeout: 10000 })

            await expect(
                page.getByRole("region", { name: /notifications/i }).locator("li").first(),
            ).toBeVisible({ timeout: 10000 })
        })

        test("should remove a project from CV", async ({ page }) => {
            const projectName = await addProject(page)

            await expect(
                page.getByText(projectName, { exact: false }),
            ).toBeVisible({ timeout: 10000 })

            await page
                .getByRole("button", { name: `Actions for ${projectName}` })
                .click()

            await page.getByRole("menuitem", { name: "Remove" }).click()

            const confirmModal = page.locator("[role='dialog']").first()
            await expect(confirmModal).toBeVisible({ timeout: 5000 })
            await confirmModal.getByRole("button", { name: "Remove" }).click()

            await expect(confirmModal).not.toBeVisible({ timeout: 10000 })

            await expect(
                page.getByText(projectName, { exact: false }),
            ).not.toBeVisible({ timeout: 10000 })
        })
    })

    test.describe("CV preview", () => {
        test.beforeEach(async ({ page }) => {
            const cvName = `Test CV ${Date.now()}`
            await createCv(
                page,
                cvName,
                "Bachelor of Computer Science",
                "Senior fullstack developer with extensive experience",
            )
            await openCvView(page, cvName)
        })

        test("should navigate to preview tab", async ({ page }) => {
            await page.locator("a[href*='/cv/'][href$='/preview']").click()
            await page.waitForURL(/\/cv\/\d+\/preview/, { timeout: 15000 })

            await expect(
                page.locator("a[href*='/cv/'][href$='/preview'][aria-current='page']")
            ).toBeVisible({
                timeout: 10000,
            })

            await expect(
                page.getByRole("button", { name: /EXPORT PDF/i })
            ).toBeVisible({
                timeout: 10000,
            })
        })
    })
})
