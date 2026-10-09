"use client"

import { cn } from "cn"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLocale } from "next-intl"
import { useMemo, useState } from "react"

interface CalendarProps {
    value?: string
    onChange: (date: string) => void
    className?: string
}

type CalendarView = "days" | "months" | "years"

function parseIsoDate(str?: string) {
    if (!str) return null
    const parts = str.split("-")
    if (parts.length !== 3) return null
    const [year, month, day] = parts.map(Number)
    if (!year || !month || !day) return null
    return { year, monthIndex: month - 1, day }
}

export function Calendar({ value, onChange, className }: CalendarProps) {
    const locale = useLocale()
    const parsedValue = parseIsoDate(value)

    const [view, setView] = useState<CalendarView>("days")
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (parsedValue) {
            return new Date(parsedValue.year, parsedValue.monthIndex, 1)
        }
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })
    const [yearRangeStart, setYearRangeStart] = useState(() => {
        const year = parsedValue?.year ?? new Date().getFullYear()
        return Math.floor(year / 12) * 12
    })

    const currentYear = currentMonth.getFullYear()
    const currentMonthIndex = currentMonth.getMonth()

    const monthNames = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(locale, { month: "long" })
        return Array.from({ length: 12 }, (_, i) => {
            const name = formatter.format(new Date(2026, i, 1))
            return name.charAt(0).toUpperCase() + name.slice(1)
        })
    }, [locale])

    const weekDays = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" })
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(2026, 0, 5 + i)
            const name = formatter.format(date)
            return name.charAt(0).toUpperCase() + name.slice(1, 2)
        })
    }, [locale])

    const handlePrev = () => {
        if (view === "days") {
            setCurrentMonth(new Date(currentYear, currentMonthIndex - 1, 1))
        } else if (view === "months") {
            setCurrentMonth(new Date(currentYear - 1, currentMonthIndex, 1))
        } else if (view === "years") {
            setYearRangeStart((prev) => prev - 12)
        }
    }

    const handleNext = () => {
        if (view === "days") {
            setCurrentMonth(new Date(currentYear, currentMonthIndex + 1, 1))
        } else if (view === "months") {
            setCurrentMonth(new Date(currentYear + 1, currentMonthIndex, 1))
        } else if (view === "years") {
            setYearRangeStart((prev) => prev + 12)
        }
    }

    const handleSelectDay = (day: number) => {
        const m = String(currentMonthIndex + 1).padStart(2, "0")
        const d = String(day).padStart(2, "0")
        onChange(`${currentYear}-${m}-${d}`)
    }

    const handleSelectMonth = (monthIndex: number) => {
        setCurrentMonth(new Date(currentYear, monthIndex, 1))
        setView("days")
    }

    const handleSelectYear = (year: number) => {
        setCurrentMonth(new Date(year, currentMonthIndex, 1))
        setView("months")
    }

    const daysInMonth = new Date(
        currentYear,
        currentMonthIndex + 1,
        0,
    ).getDate()
    const firstDayOffset = (() => {
        const day = new Date(currentYear, currentMonthIndex, 1).getDay()
        return day === 0 ? 6 : day - 1
    })()
    const daysInPrevMonth = new Date(
        currentYear,
        currentMonthIndex,
        0,
    ).getDate()

    const days = []
    for (let i = firstDayOffset - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, isCurrentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true })
    }
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ day: i, isCurrentMonth: false })
    }

    return (
        <div
            className={cn(
                "w-[260px] select-none rounded-2xl border border-[#cccccc] bg-white p-3.5 shadow-2xl dark:border-[#333333] dark:bg-[#222222]",
                className,
            )}
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-normal tracking-tight">
                    <button
                        type="button"
                        onClick={() =>
                            setView(view === "months" ? "days" : "months")
                        }
                        className={cn(
                            "transition-colors hover:opacity-80",
                            view === "months"
                                ? "text-[#E53935]"
                                : "text-foreground dark:text-white",
                        )}
                    >
                        {monthNames[currentMonthIndex]}
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setView(view === "years" ? "days" : "years")
                        }
                        className={cn(
                            "transition-colors hover:opacity-80",
                            view === "years"
                                ? "text-[#E53935]"
                                : "text-foreground dark:text-white",
                        )}
                    >
                        {currentYear}
                    </button>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#cccccc] text-muted-foreground transition-colors hover:bg-muted dark:border-[#424242] dark:text-white dark:hover:bg-[#333333]"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#cccccc] text-muted-foreground transition-colors hover:bg-muted dark:border-[#424242] dark:text-white dark:hover:bg-[#333333]"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {view === "days" && (
                <>
                    <div className="mb-1.5 grid grid-cols-7 text-center text-xs font-normal text-muted-foreground dark:text-[#888888]">
                        {weekDays.map((d, i) => (
                            <div key={i}>{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-1 text-center">
                        {days.map((d, idx) => {
                            const cellFormatted = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`
                            const isSelected =
                                d.isCurrentMonth && value === cellFormatted

                            return (
                                <div
                                    key={idx}
                                    className="flex h-7 items-center justify-center"
                                >
                                    <button
                                        type="button"
                                        disabled={!d.isCurrentMonth}
                                        onClick={() => handleSelectDay(d.day)}
                                        className={cn(
                                            "flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all",
                                            !d.isCurrentMonth &&
                                                "cursor-default text-muted/30 dark:text-[#555555]",
                                            d.isCurrentMonth &&
                                                !isSelected &&
                                                "text-foreground hover:bg-[#E53935] hover:text-white dark:text-white",
                                            isSelected &&
                                                "!bg-[#E53935] font-normal !text-white shadow-sm",
                                        )}
                                    >
                                        {d.day}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {view === "months" && (
                <div className="grid grid-cols-3 gap-x-1.5 gap-y-2 py-1">
                    {monthNames.map((name, idx) => {
                        const isSelected = idx === currentMonthIndex
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => handleSelectMonth(idx)}
                                className={cn(
                                    "rounded-[4px] px-1 py-2 text-center text-xs font-normal transition-all",
                                    isSelected
                                        ? "!bg-[#E53935] !text-white"
                                        : "text-foreground hover:bg-[#E53935] hover:text-white dark:text-white",
                                )}
                            >
                                {name}
                            </button>
                        )
                    })}
                </div>
            )}

            {view === "years" && (
                <div className="grid grid-cols-3 gap-x-1.5 gap-y-2 py-1">
                    {Array.from(
                        { length: 12 },
                        (_, i) => yearRangeStart + i,
                    ).map((y) => {
                        const isSelected = y === currentYear
                        return (
                            <button
                                key={y}
                                type="button"
                                onClick={() => handleSelectYear(y)}
                                className={cn(
                                    "rounded-[4px] px-1 py-2 text-center text-xs font-normal transition-all",
                                    isSelected
                                        ? "!bg-[#E53935] !text-white"
                                        : "text-foreground hover:bg-[#E53935] hover:text-white dark:text-white",
                                )}
                            >
                                {y}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
