import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("react", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react")>()
    return {
        ...actual,
        useSyncExternalStore: (
            _subscribe: () => () => void,
            getSnapshot: () => unknown,
        ) => getSnapshot(),
    }
})

import { DatePicker } from "../date-picker"

vi.mock("../calendar", () => ({
    Calendar: ({
        value,
        onChange,
    }: {
        value?: string
        onChange: (date: string) => void
    }) => (
        <div data-testid="mock-calendar">
            <span data-testid="calendar-value">{value}</span>
            <button
                type="button"
                onClick={() => onChange("2026-06-20")}
                data-testid="select-valid-date"
            >
                Select 2026-06-20
            </button>
            <button
                type="button"
                onClick={() => onChange("2026-06-01")}
                data-testid="select-early-date"
            >
                Select 2026-06-01
            </button>
            <button
                type="button"
                onClick={() => onChange("2026-06-30")}
                data-testid="select-late-date"
            >
                Select 2026-06-30
            </button>
        </div>
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("DatePicker component", () => {
    const defaultProps = {
        value: "2026-06-15",
        onChange: vi.fn(),
        placeholder: "Select date",
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders trigger with formatted date when value is provided", () => {
        render(<DatePicker {...defaultProps} />)

        const trigger = screen.getByText((content) => content.includes("2026"))
        expect(trigger).toBeInTheDocument()
    })

    it("renders placeholder when value is empty", () => {
        render(
            <DatePicker {...defaultProps} value="" placeholder="Pick a day" />,
        )

        expect(screen.getByText("Pick a day")).toBeInTheDocument()
    })

    it("opens calendar portal on trigger click and closes on outside click", () => {
        render(<DatePicker {...defaultProps} />)

        expect(screen.queryByTestId("mock-calendar")).not.toBeInTheDocument()

        const trigger = screen.getByText((content) => content.includes("2026"))
        fireEvent.click(trigger)

        expect(screen.getByTestId("mock-calendar")).toBeInTheDocument()

        fireEvent.mouseDown(document.body)

        expect(screen.queryByTestId("mock-calendar")).not.toBeInTheDocument()
    })

    it("calls onChange and closes calendar when a valid date is selected", () => {
        const onChange = vi.fn()
        render(<DatePicker {...defaultProps} onChange={onChange} />)

        fireEvent.click(screen.getByText((content) => content.includes("2026")))
        expect(screen.getByTestId("mock-calendar")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("select-valid-date"))

        expect(onChange).toHaveBeenCalledWith("2026-06-20")
        expect(screen.queryByTestId("mock-calendar")).not.toBeInTheDocument()
    })

    it("respects minDate and maxDate constraints", () => {
        const onChange = vi.fn()
        render(
            <DatePicker
                {...defaultProps}
                minDate="2026-06-10"
                maxDate="2026-06-25"
                onChange={onChange}
            />,
        )

        fireEvent.click(screen.getByText((content) => content.includes("2026")))

        fireEvent.click(screen.getByTestId("select-early-date"))
        expect(onChange).not.toHaveBeenCalled()
        expect(screen.getByTestId("mock-calendar")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("select-late-date"))
        expect(onChange).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId("select-valid-date"))
        expect(onChange).toHaveBeenCalledWith("2026-06-20")
        expect(screen.queryByTestId("mock-calendar")).not.toBeInTheDocument()
    })
})
