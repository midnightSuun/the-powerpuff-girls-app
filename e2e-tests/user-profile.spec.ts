import { expect, test } from "@playwright/test"

test.describe("Own profile workflow", () => {
    test("should edit own profile and switch profile tabs", async ({
        page,
    }) => {
        test.setTimeout(120_000)

        await page.goto("/login")
        await expect(page).toHaveURL(/.*login/)

        const signupTab = page.locator('a[href="/register"]')
        await expect(signupTab).toBeVisible()
        await signupTab.click()
        await expect(page).toHaveURL(/.*register/)

        const uniqueEmail = `test.user.${Date.now()}@example.com`
        const password = "SecurePassword123!"
        const firstName = "Ada"
        const lastName = `Lovelace${Date.now().toString().slice(-4)}`

        await page.fill('input[type="email"]', uniqueEmail)

        const passwordInputs = page.locator('input[type="password"]')
        await passwordInputs.nth(0).fill(password)
        await passwordInputs.nth(1).fill(password)

        const submitButton = page.getByRole("button", {
            name: /create account|signup|register|зарегистрироваться/i,
        })
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        const laterButton = page.getByRole("button", { name: /later|позже/i })
        await expect(laterButton).toBeVisible({ timeout: 20_000 })
        await laterButton.click()

        await expect(page).toHaveURL(/\/users\/?$/, { timeout: 30_000 })

        const accountButton = page.getByRole("button", { name: uniqueEmail })
        await expect(accountButton).toBeVisible({ timeout: 20_000 })
        await accountButton.click()
        await page
            .getByRole("menuitem", { name: "Profile", exact: true })
            .click()

        await expect(page).toHaveURL(/\/users\/[^/]+\/profile$/, {
            timeout: 20_000,
        })

        const firstNameInput = page.locator("#profile-first-name")
        const lastNameInput = page.locator("#profile-last-name")
        await expect(firstNameInput).toBeVisible()
        await firstNameInput.fill(firstName)
        await lastNameInput.fill(lastName)

        const departmentSelect = page.getByRole("combobox").nth(0)
        const positionSelect = page.getByRole("combobox").nth(1)

        const chooseFirstOption = async (
            select: ReturnType<typeof page.getByRole>,
        ) => {
            await select.click()
            const listbox = page.getByRole("listbox")
            await expect(listbox).toBeVisible()
            await page.keyboard.press("ArrowDown")
            await page.keyboard.press("Enter")
            await expect(listbox).toBeHidden()
            const name = (await select.innerText()).replace("▼", "").trim()
            expect(name).not.toMatch(/^select /i)
            return name
        }

        const departmentName = await chooseFirstOption(departmentSelect)
        const positionName = await chooseFirstOption(positionSelect)

        const updateButton = page.getByRole("button", {
            name: "UPDATE",
            exact: true,
        })
        await expect(updateButton).toBeEnabled()
        await updateButton.click()

        await expect(
            page.getByText("Profile updated successfully."),
        ).toBeVisible({ timeout: 20_000 })
        await expect(
            page.getByRole("heading", { name: `${firstName} ${lastName}` }),
        ).toBeVisible()

        const profileTabs = page.locator("header").filter({
            has: page.getByRole("navigation", { name: "Breadcrumb" }),
        })

        await profileTabs
            .getByRole("link", { name: "Skills", exact: true })
            .click()
        await expect(page).toHaveURL(/\/users\/[^/]+\/skills$/)
        await expect(page.getByText("No skills here")).toBeVisible()

        await profileTabs
            .getByRole("link", { name: "Languages", exact: true })
            .click()
        await expect(page).toHaveURL(/\/users\/[^/]+\/languages$/)
        await expect(page.getByText("Current languages")).toBeVisible()
        await expect(page.getByText("No languages added yet.")).toBeVisible()

        await profileTabs
            .getByRole("link", { name: "CVs", exact: true })
            .click()
        await expect(page).toHaveURL(/\/users\/[^/]+\/cv$/)
        await expect(page.getByRole("link", { name: "Name" })).toBeVisible()
        await expect(page.getByText(uniqueEmail).first()).toBeVisible()

        await profileTabs
            .getByRole("link", { name: "Profile", exact: true })
            .click()
        await expect(page).toHaveURL(/\/users\/[^/]+\/profile$/)
        await expect(firstNameInput).toHaveValue(firstName)
        await expect(lastNameInput).toHaveValue(lastName)
        await expect(departmentSelect).toContainText(departmentName)
        await expect(positionSelect).toContainText(positionName)
    })
})
