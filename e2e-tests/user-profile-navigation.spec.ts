import { expect, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"

test.describe("User Profile View & Navigation Flow", () => {
    test("should allow registered user to view other user's profile, switch top tabs, and verify read-only mode", async ({
        page,
    }) => {
        await registerAndSkipVerification(page)

        const usersTable = page.locator("table, [role='table']").first()
        await expect(usersTable).toBeVisible()

        // Locate the first user link in the table body (skip header/sort links)
        const firstUserLink = page
            .locator(
                "tbody tr td a, [role='rowgroup'] [role='row'] [role='cell'] a",
            )
            .first()
        await expect(firstUserLink).toBeVisible({ timeout: 10000 })

        const userHref = await firstUserLink.getAttribute("href")
        const userIdMatch = userHref?.match(/\/users\/([^/]+)/)
        const userId = userIdMatch?.[1]
        expect(userId).toBeTruthy()

        await firstUserLink.click()

        const profileTab = page.locator(`a[href*='/users/${userId}/profile']`)
        const skillsTab = page.locator(`a[href*='/users/${userId}/skills']`)
        const languagesTab = page.locator(
            `a[href*='/users/${userId}/languages']`,
        )

        await expect(profileTab).toBeVisible({ timeout: 10000 })
        await expect(skillsTab).toBeVisible()
        await expect(languagesTab).toBeVisible()

        await skillsTab.click()
        await expect(page).toHaveURL(/\/users\/[^\/]+\/skills/, {
            timeout: 10000,
        })

        await languagesTab.click()
        await expect(page).toHaveURL(/\/users\/[^\/]+\/languages/, {
            timeout: 10000,
        })

        await page.waitForLoadState("networkidle")
        await page.locator(`a[href*='/users/${userId}/profile']`).click()
        await expect(page).toHaveURL(/\/users\/[^\/]+\/profile/, {
            timeout: 10000,
        })

        // Profile inputs must be disabled or readonly for a user viewing another's profile
        const mainContainer = page.getByRole("main")
        // Target the first named text input in the profile form (first name field),
        // not the search input which is type="search"
        const profileInput = mainContainer
            .locator("input[type='text'], input[type='email']")
            .first()
        await expect(profileInput).toBeVisible({ timeout: 10000 })

        const isDisabledOrReadonly =
            (await profileInput.isDisabled()) ||
            (await profileInput.getAttribute("readonly")) !== null ||
            (await profileInput.getAttribute("aria-readonly")) === "true"

        expect(isDisabledOrReadonly).toBeTruthy()
    })
})
