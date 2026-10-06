"use client"

import { ChevronDown, Plus, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"

interface EnvironmentMultiselectProps {
    options: string[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder: string
    addLabel: string
    removeLabel: (value: string) => string
    compact?: boolean
}

export function EnvironmentMultiselect({
    options,
    value,
    onChange,
    placeholder,
    addLabel,
    removeLabel,
    compact = false,
}: EnvironmentMultiselectProps) {
    const [customOption, setCustomOption] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const allOptions = Array.from(new Set([...options, ...value]))

    useEffect(() => {
        if (!isOpen) return

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (
                event.target instanceof Node &&
                !containerRef.current?.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("pointerdown", closeOnOutsideClick)
        return () =>
            document.removeEventListener("pointerdown", closeOnOutsideClick)
    }, [isOpen])

    const toggleOption = (option: string, selected: boolean) => {
        onChange(
            selected
                ? [...value, option]
                : value.filter((item) => item !== option),
        )
    }

    const addCustomOption = () => {
        const option = customOption.trim()
        if (!option) return
        if (!value.includes(option)) onChange([...value, option])
        setCustomOption("")
    }

    return (
        <div
            ref={containerRef}
            onKeyDown={(event) => {
                if (event.key === "Escape") setIsOpen(false)
            }}
            className="relative"
        >
            <div
                className={`flex flex-wrap items-center gap-1.5 rounded-none border border-border bg-background px-2.5 text-foreground ${
                    compact ? "min-h-8" : "min-h-10"
                } ${compact ? "py-1" : "py-1.5"}`}
            >
                {value.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                        {placeholder}
                    </span>
                )}
                {value.map((option) => (
                    <span
                        key={option}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-foreground"
                    >
                        {option}
                        <button
                            type="button"
                            aria-label={removeLabel(option)}
                            onClick={() => toggleOption(option, false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X aria-hidden="true" className="size-3" />
                        </button>
                    </span>
                ))}

                <button
                    type="button"
                    aria-label={placeholder}
                    aria-expanded={isOpen}
                    aria-controls="environment-options"
                    onClick={() => setIsOpen((open) => !open)}
                    className="ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <ChevronDown aria-hidden="true" className="size-4" />
                </button>
            </div>

            {isOpen && (
                <div
                    id="environment-options"
                    role="region"
                    aria-label={placeholder}
                    className="mt-2 w-full rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-sm"
                >
                    <div className="flex gap-1.5 pb-2">
                        <Input
                            value={customOption}
                            onChange={(event) =>
                                setCustomOption(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault()
                                    addCustomOption()
                                }
                            }}
                            placeholder={addLabel}
                            className="h-8 bg-background text-xs"
                        />
                        <button
                            type="button"
                            aria-label={addLabel}
                            disabled={!customOption.trim()}
                            onClick={(event) => {
                                event.preventDefault()
                                addCustomOption()
                            }}
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded border border-border bg-background text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                        >
                            <Plus aria-hidden="true" className="size-4" />
                        </button>
                    </div>
                    <div className="grid max-h-40 grid-cols-1 gap-x-2 gap-y-1 overflow-y-auto sm:grid-cols-2">
                        {allOptions.map((option) => (
                            <label
                                key={option}
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent"
                            >
                                <input
                                    type="checkbox"
                                    checked={value.includes(option)}
                                    onChange={(event) =>
                                        toggleOption(
                                            option,
                                            event.target.checked,
                                        )
                                    }
                                    className="size-3.5 accent-primary"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
