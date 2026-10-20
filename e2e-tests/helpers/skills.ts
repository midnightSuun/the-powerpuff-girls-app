import { expect, Page } from "@playwright/test"

const waitUntilInteractive = async (page: Page) => {
    await expect(page.locator("[aria-busy='true']")).toHaveCount(0, {
        timeout: 15000,
    })
}

async function pickSelectOption(
    page: Page,
    trigger: ReturnType<Page["locator"]>,
    optionIndex: number,
): Promise<string> {
    await waitUntilInteractive(page)
    await trigger.click({ timeout: 5000 })

    const option = page
        .getByRole("listbox")
        .getByRole("option")
        .nth(optionIndex)
    await expect(option).toBeVisible({ timeout: 5000 })

    const text = ((await option.textContent()) ?? "").trim()
    await option.click({ timeout: 5000 })
    await expect(option).toBeHidden({ timeout: 5000 })

    return text
}

export async function navigateToSkills(page: Page) {
    const skillsLink = page.locator("a[href*='/skills']").first()
    await expect(skillsLink).toBeVisible({ timeout: 10000 })
    await skillsLink.click()
    await page.waitForURL(/.*skills/, { timeout: 10000 })
    await waitUntilInteractive(page)
}

export async function addSkill(page: Page): Promise<string> {
    await waitUntilInteractive(page)

    const addButton = page.getByRole("button", { name: "ADD SKILL" })
    await expect(addButton).toBeVisible({ timeout: 10000 })

    let lastError: unknown

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const modal = page.getByRole("dialog", { name: "Add skill" })

            if (!(await modal.isVisible())) {
                await addButton.click()
                await expect(modal).toBeVisible({ timeout: 5000 })
            }

            const skillName = await pickSelectOption(
                page,
                modal.getByRole("combobox").nth(0),
                0,
            )
            await pickSelectOption(page, modal.getByRole("combobox").nth(1), 0)

            const submitBtn = modal.getByRole("button", { name: "ADD" })
            await expect(submitBtn).toBeEnabled({ timeout: 5000 })
            await submitBtn.click()
            await expect(modal).toBeHidden({ timeout: 20000 })

            return skillName
        } catch (error) {
            lastError = error
            await page.keyboard.press("Escape")
        }
    }

    throw lastError
}
