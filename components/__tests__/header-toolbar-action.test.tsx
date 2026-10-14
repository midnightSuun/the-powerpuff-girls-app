import { act, render, renderHook, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
    HeaderToolbarActionsProvider,
    useHeaderToolbarAction,
    useHeaderToolbarActionValue,
} from "../header-toolbar-action"

describe("HeaderToolbar Context & Hooks", () => {
    describe("HeaderToolbarActionsProvider & useHeaderToolbarActionValue", () => {
        it("provides null action by default", () => {
            const TestConsumer = () => {
                const action = useHeaderToolbarActionValue()
                return (
                    <div data-testid="action-value">
                        {action ? action.label : "null"}
                    </div>
                )
            }

            render(
                <HeaderToolbarActionsProvider>
                    <TestConsumer />
                </HeaderToolbarActionsProvider>,
            )

            expect(screen.getByTestId("action-value")).toHaveTextContent("null")
        })
    })

    describe("useHeaderToolbarAction", () => {
        it("registers and unregisters toolbar action correctly", () => {
            const onClickMock = vi.fn()

            const TestComponent = ({ label }: { label: string | null }) => {
                useHeaderToolbarAction(label, onClickMock)
                const action = useHeaderToolbarActionValue()

                return (
                    <div>
                        <span data-testid="label">
                            {action?.label ?? "none"}
                        </span>
                        <button data-testid="trigger" onClick={action?.onClick}>
                            Click
                        </button>
                    </div>
                )
            }

            const { rerender } = render(
                <HeaderToolbarActionsProvider>
                    <TestComponent label="Save Changes" />
                </HeaderToolbarActionsProvider>,
            )

            expect(screen.getByTestId("label")).toHaveTextContent(
                "Save Changes",
            )
            act(() => {
                screen.getByTestId("trigger").click()
            })
            expect(onClickMock).toHaveBeenCalledTimes(1)

            rerender(
                <HeaderToolbarActionsProvider>
                    <TestComponent label={null} />
                </HeaderToolbarActionsProvider>,
            )
            expect(screen.getByTestId("label")).toHaveTextContent("none")
        })

        it("updates click handler reference without re-triggering effect loop", () => {
            const firstClickHandler = vi.fn()
            const secondClickHandler = vi.fn()

            const { result, rerender } = renderHook(
                ({ cb }) => {
                    useHeaderToolbarAction("Edit", cb)
                    return useHeaderToolbarActionValue()
                },
                {
                    wrapper: HeaderToolbarActionsProvider,
                    initialProps: { cb: firstClickHandler },
                },
            )

            expect(result.current?.label).toBe("Edit")

            act(() => {
                result.current?.onClick()
            })
            expect(firstClickHandler).toHaveBeenCalledTimes(1)
            expect(secondClickHandler).not.toHaveBeenCalled()

            rerender({ cb: secondClickHandler })

            act(() => {
                result.current?.onClick()
            })
            expect(firstClickHandler).toHaveBeenCalledTimes(1)
            expect(secondClickHandler).toHaveBeenCalledTimes(1)
        })
    })
})
