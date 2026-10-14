import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteLanguageModal } from "../hooks/use-delete-language-modal"
import { DeleteLanguagesModal } from "../ui/components/user/delete-languages-modal"

vi.mock("next-intl", () => {
    const tFn = (key: string) => key
    tFn.rich = (key: string, values?: Record<string, string | number>) =>
        values?.count ? `confirmation-${values.count}` : key

    return {
        useTranslations: () => tFn,
        useLocale: () => "en",
    }
})

vi.mock("@/modules/languages/hooks/use-delete-language-modal", () => ({
    useDeleteLanguageModal: vi.fn(),
}))

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: ({
        isOpen,
        title,
        description,
        error,
        isDeleting,
        onConfirm,
        onClose,
    }: {
        isOpen: boolean
        title: string
        description: React.ReactNode
        error?: string | null
        isDeleting?: boolean
        onConfirm: () => void
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                <h2 data-testid="modal-title">{title}</h2>
                <div data-testid="modal-description">{description}</div>
                {error && <div data-testid="modal-error">{error}</div>}
                <button
                    disabled={isDeleting}
                    onClick={onConfirm}
                    data-testid="confirm-delete-btn"
                >
                    Confirm
                </button>
                <button onClick={onClose} data-testid="close-delete-btn">
                    Close
                </button>
            </div>
        ) : null,
}))

type HookReturnType = ReturnType<typeof useDeleteLanguageModal>

describe("DeleteLanguagesModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()
    const mockHandleConfirm = vi.fn()

    const defaultHookValues: HookReturnType = {
        error: null,
        isDeleting: false,
        handleConfirm: mockHandleConfirm,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useDeleteLanguageModal).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(
            <DeleteLanguagesModal
                isOpen={false}
                onClose={mockOnClose}
                count={2}
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
    })

    it("renders singular title when count is 1", () => {
        render(
            <DeleteLanguagesModal
                isOpen={true}
                onClose={mockOnClose}
                count={1}
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
        expect(screen.getByTestId("modal-title")).toHaveTextContent(
            "titleSingular",
        )
    })

    it("renders plural title when count is greater than 1", () => {
        render(
            <DeleteLanguagesModal
                isOpen={true}
                onClose={mockOnClose}
                count={3}
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
        expect(screen.getByTestId("modal-title")).toHaveTextContent(
            "titlePlural",
        )
    })

    it("displays error message when provided", () => {
        vi.mocked(useDeleteLanguageModal).mockReturnValue({
            ...defaultHookValues,
            error: "Failed to delete languages",
        })

        render(
            <DeleteLanguagesModal
                isOpen={true}
                onClose={mockOnClose}
                count={2}
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to delete languages",
        )
    })

    it("disables confirm button when isDeleting is true", () => {
        vi.mocked(useDeleteLanguageModal).mockReturnValue({
            ...defaultHookValues,
            isDeleting: true,
        })

        render(
            <DeleteLanguagesModal
                isOpen={true}
                onClose={mockOnClose}
                count={2}
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("confirm-delete-btn")).toBeDisabled()
    })

    it("triggers handleConfirm when confirmation button is clicked", () => {
        render(
            <DeleteLanguagesModal
                isOpen={true}
                onClose={mockOnClose}
                count={2}
                onConfirm={mockOnConfirm}
            />,
        )

        const confirmBtn = screen.getByTestId("confirm-delete-btn")
        fireEvent.click(confirmBtn)

        expect(mockHandleConfirm).toHaveBeenCalledTimes(1)
    })

    it("triggers onClose when close button is clicked", () => {
        const { container } = render(
            <DeleteLanguagesModal
                isOpen={true}
                onClose={mockOnClose}
                count={2}
                onConfirm={mockOnConfirm}
            />,
        )

        const closeBtn = container.querySelector(
            '[data-testid="close-delete-btn"]',
        ) as HTMLButtonElement
        fireEvent.click(closeBtn)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
})
