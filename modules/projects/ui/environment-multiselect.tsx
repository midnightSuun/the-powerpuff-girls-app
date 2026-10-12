"use client"

import { cn } from "cn"
import { Check, ChevronDown, ChevronUp, X } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

interface EnvironmentMultiselectProps {
    options: string[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    addLabel?: string
    removeLabel?: (value: string) => string
    compact?: boolean
    error?: string
    className?: string
}

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function EnvironmentMultiselect({
    options,
    value = [],
    onChange,
    placeholder = "Position",
    error,
    className,
}: EnvironmentMultiselectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const mounted = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    )
    const containerRef = useRef<HTMLDivElement>(null)
    const [coords, setCoords] = useState<{
        top: number
        left: number
        width: number
    }>({
        top: 0,
        left: 0,
        width: 0,
    })

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
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
                    "multiselect-dropdown-portal",
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

    const handleToggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter((item) => item !== option))
        } else {
            onChange([...value, option])
        }
    }

    const handleRemoveTag = (e: React.MouseEvent, optionToRemove: string) => {
        e.stopPropagation()
        onChange(value.filter((item) => item !== optionToRemove))
    }

    return (
        <div ref={containerRef} className="relative w-full select-none">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex min-h-9 w-full cursor-pointer items-center justify-between gap-1.5 border bg-background px-2.5 py-1.5 text-xs transition-colors",
                    "border-[#2E2E2E] text-[#2E2E2E] dark:border-[#F5F5F7] dark:text-[#F5F5F7]",
                    error && "border-red-500 dark:border-red-500",
                    className,
                )}
            >
                <div className="flex flex-wrap items-center gap-1.5 pr-2">
                    {value.length > 0 ? (
                        value.map((item) => (
                            <span
                                key={item}
                                className={cn(
                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-normal transition-colors",
                                    "border-[#2E2E2E] text-[#2E2E2E] dark:border-[#F5F5F7] dark:text-[#F5F5F7]",
                                )}
                            >
                                <span>{item}</span>
                                <button
                                    type="button"
                                    onClick={(e) => handleRemoveTag(e, item)}
                                    className="flex h-3 w-3 items-center justify-center rounded-full hover:opacity-70"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-muted-foreground">
                            {placeholder}
                        </span>
                    )}
                </div>

                <div className="flex shrink-0 items-center justify-center">
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-[#2E2E2E] dark:text-[#F5F5F7]" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-[#2E2E2E] dark:text-[#F5F5F7]" />
                    )}
                </div>
            </div>

            {isOpen &&
                mounted &&
                createPortal(
                    <div
                        id="multiselect-dropdown-portal"
                        style={{
                            position: "fixed",
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`,
                        }}
                        className={cn(
                            "z-[9999] max-h-56 overflow-y-auto border bg-background shadow-xl",
                            "border-[#2E2E2E] dark:border-[#F5F5F7]",
                        )}
                    >
                        {options.map((option) => {
                            const isSelected = value.includes(option)

                            return (
                                <div
                                    key={option}
                                    onClick={() => handleToggleOption(option)}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs transition-colors",
                                        "text-[#2E2E2E] dark:text-[#F5F5F7]",
                                        "hover:bg-[#AEAEAE] dark:hover:bg-[#626262]",
                                        isSelected &&
                                            "bg-[#626262] text-[#F5F5F7] dark:bg-[#F5F5F7] dark:text-[#2E2E2E]",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
                                            isSelected
                                                ? "border-[#F5F5F7] bg-transparent dark:border-[#2E2E2E]"
                                                : "border-[#2E2E2E] dark:border-[#F5F5F7]",
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="h-3 w-3 text-[#F5F5F7] dark:text-[#2E2E2E]" />
                                        )}
                                    </div>

                                    <span className="font-normal font-sans">
                                        {option}
                                    </span>
                                </div>
                            )
                        })}
                    </div>,
                    document.body,
                )}

            {error && (
                <span className="mt-1 text-[10px] text-red-500">{error}</span>
            )}
        </div>
    )
}
