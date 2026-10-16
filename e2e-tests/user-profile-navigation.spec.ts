import { expect, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"

test.describe("User Profile View & Navigation Flow", () => {
    test("should allow registered user to view other user's profile, switch top tabs, and verify read-only mode", async ({
        page,
    }) => {
        await registerAndSkipVerification(page)

        const usersTable = page.locator("table, [role='table']").first()
        await expect(usersTable).toBeVisible()

        const firstUserLink = page.locator("tbody tr a, [role='row'] a").first()
        await expect(firstUserLink).toBeVisible()
        await firstUserLink.click()

        const mainContainer = page.getByRole("main")
        const profileTab = mainContainer.getByRole("link", {
            name: /профиль|profile/i,
        })
        const skillsTab = mainContainer.getByRole("link", {
            name: /навыки|skills/i,
        })
        const languagesTab = mainContainer.getByRole("link", {
            name: /языки|languages/i,
        })

        await expect(profileTab).toBeVisible({ timeout: 10000 })
        await expect(skillsTab).toBeVisible()
        await expect(languagesTab).toBeVisible()

        await skillsTab.click()
        await expect(page).toHaveURL(/\/users\/[^\/]+\/skills/)

        await languagesTab.click()
        await expect(page).toHaveURL(/\/users\/[^\/]+\/languages/)

        await profileTab.click()
        await expect(page).toHaveURL(/\/users\/[^\/]+\/profile/)

        const nameInput = mainContainer.locator("input").first()
        await expect(nameInput).toBeVisible({ timeout: 10000 })

        const isDisabledOrReadonly =
            (await nameInput.isDisabled()) ||
            (await nameInput.getAttribute("readonly")) !== null ||
            (await nameInput.getAttribute("aria-readonly")) === "true"

        expect(isDisabledOrReadonly).toBeTruthy()
    })
})
