"use client"

import { cn } from "cn"
import { CalendarIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import { Calendar } from "./calendar"

interface DatePickerProps {
    value: string
    onChange: (val: string) => void
    placeholder?: string
    className?: string
    minDate?: string
    maxDate?: string
}

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function DatePicker({
    value,
    onChange,
    placeholder,
    className,
    minDate,
    maxDate,
}: DatePickerProps) {
    const locale = useLocale()
    const t = useTranslations("Calendar")
    const [isOpen, setIsOpen] = useState(false)
    const mounted = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    )
    const containerRef = useRef<HTMLDivElement>(null)
    const [coords, setCoords] = useState<{ top: number; left: number }>({
        top: 0,
        left: 0,
    })

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
            })
        }
    }

    useEffect(() => {
        if (isOpen) {
            updateCoords()
            window.addEventListener("resize", updateCoords)
            window.addEventListener("scroll", updateCoords, true)
        }
        return () => {
            window.removeEventListener("resize", updateCoords)
            window.removeEventListener("scroll", updateCoords, true)
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                containerRef.current &&
                !containerRef.current.contains(target)
            ) {
                const portalEl = document.getElementById(
                    "datepicker-dropdown-portal",
                )
                if (portalEl && portalEl.contains(target)) {
                    return
                }
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
        if (minDate && newDate < minDate) return
        if (maxDate && newDate > maxDate) return
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

            {isOpen &&
                mounted &&
                createPortal(
                    <div
                        id="datepicker-dropdown-portal"
                        style={{
                            position: "fixed",
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                        className="z-[9999]"
                    >
                        <Calendar value={value} onChange={handleDateSelect} />
                    </div>,
                    document.body,
                )}
        </div>
    )
}
