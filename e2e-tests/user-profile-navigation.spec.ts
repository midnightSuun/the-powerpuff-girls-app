import { expect, test } from "@playwright/test"

import { registerAndSkipVerification } from "./helpers/auth"

test.describe("User Profile View & Navigation Flow", () => {
    test("should allow registered user to view other user's profile, switch top tabs, and verify read-only mode", async ({
        page,
    }) => {
        const { uniqueEmail } = await registerAndSkipVerification(page)

        const usersTable = page.locator("table, [role='table']").first()
        await expect(usersTable).toBeVisible()

        const anyUserLink = page.locator("tbody tr td:first-child a").first()
        await expect(anyUserLink).toBeVisible({ timeout: 10000 })

        const otherUserLink = page
            .locator("tbody tr")
            .filter({ hasNotText: uniqueEmail })
            .locator("td:first-child a")
            .first()
        await expect(otherUserLink).toBeVisible({ timeout: 10000 })

        const userHref = await otherUserLink.getAttribute("href")
        const userIdMatch = userHref?.match(/\/users\/([^/]+)/)
        const userId = userIdMatch?.[1]
        expect(userId).toBeTruthy()

        await otherUserLink.click()

        await expect(page).toHaveURL(/\/users\/[^/]+\/profile$/, {
            timeout: 15000,
        })

        const profileTab = page.locator(`a[href*='/users/${userId}/profile']`)
        const skillsTab = page.locator(`a[href*='/users/${userId}/skills']`)
        const languagesTab = page.locator(
            `a[href*='/users/${userId}/languages']`,
        )

        await expect(profileTab).toBeVisible({ timeout: 10000 })
        await expect(skillsTab).toBeVisible()
        await expect(languagesTab).toBeVisible()

        await skillsTab.click()
        await expect(page).toHaveURL(/\/users\/[^/]+\/skills$/, {
            timeout: 10000,
        })

        await languagesTab.click()
        await expect(page).toHaveURL(/\/users\/[^/]+\/languages$/, {
            timeout: 10000,
        })

        await page.locator(`a[href*='/users/${userId}/profile']`).click()
        await expect(page).toHaveURL(/\/users\/[^/]+\/profile$/, {
            timeout: 10000,
        })

        const firstNameInput = page.locator("#profile-first-name")
        await expect(firstNameInput).toBeVisible({ timeout: 10000 })
        await expect(firstNameInput).toBeDisabled()
    })
})
