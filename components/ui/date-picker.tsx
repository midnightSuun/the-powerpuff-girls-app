"use client"

import { cn } from "cn"
import { CalendarIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { Calendar } from "./calendar"

interface DatePickerProps {
    value: string
    onChange: (val: string) => void
    placeholder?: string
    className?: string
}

export function DatePicker({
    value,
    onChange,
    placeholder,
    className,
}: DatePickerProps) {
    const locale = useLocale()
    const t = useTranslations("Calendar")
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const displayValue = (() => {
        if (!value) return ""
        const parts = value.split("-")
        if (parts.length !== 3) return ""
        const [y, m, d] = parts.map(Number)
        if (!y || !m || !d) return ""
        return new Intl.DateTimeFormat(locale).format(new Date(y, m - 1, d))
    })()

    const handleDateSelect = (newDate: string) => {
        onChange(newDate)
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-9 w-full cursor-pointer items-center justify-between border border-[#cccccc] bg-background px-2.5 text-xs text-foreground transition-colors dark:border-border dark:bg-transparent dark:text-[#E2E2E4]",
                    isOpen && "border-[#E53935] dark:border-[#E53935]",
                    className,
                )}
            >
                <span className={cn(!displayValue && "text-muted-foreground")}>
                    {displayValue || placeholder || t("placeholder")}
                </span>
                <CalendarIcon className="h-4 w-4 text-muted-foreground dark:text-[#AEAEAE]" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1">
                    <Calendar value={value} onChange={handleDateSelect} />
                </div>
            )}
        </div>
    )
}
