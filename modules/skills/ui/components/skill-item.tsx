import React from "react"

interface SkillItemProps {
    name: string
    mastery: string | number
    isDarkMode?: boolean
    isSelectionMode?: boolean
    isSelected?: boolean
    onSelect?: () => void
}

const MASTERY_LEVELS: Record<
    string | number,
    { width: string; colorClass: string; trackBgClass: string }
> = {
    0: {
        width: "0%",
        colorClass: "bg-transparent",
        trackBgClass: "bg-muted",
    },
    1: {
        width: "25%",
        colorClass: "bg-neutral-500 dark:bg-neutral-400",
        trackBgClass: "bg-muted",
    },
    Novice: {
        width: "25%",
        colorClass: "bg-neutral-500 dark:bg-neutral-400",
        trackBgClass: "bg-muted",
    },
    2: {
        width: "45%",
        colorClass: "bg-sky-500",
        trackBgClass: "bg-sky-200 dark:bg-sky-950/60",
    },
    Advanced: {
        width: "45%",
        colorClass: "bg-sky-500",
        trackBgClass: "bg-sky-200 dark:bg-sky-950/60",
    },
    3: {
        width: "60%",
        colorClass: "bg-green-600",
        trackBgClass: "bg-green-200 dark:bg-green-950/60",
    },
    Competent: {
        width: "60%",
        colorClass: "bg-green-600",
        trackBgClass: "bg-green-200 dark:bg-green-950/60",
    },
    4: {
        width: "75%",
        colorClass: "bg-amber-500",
        trackBgClass: "bg-amber-200 dark:bg-amber-950/60",
    },
    Proficient: {
        width: "75%",
        colorClass: "bg-amber-500",
        trackBgClass: "bg-amber-200 dark:bg-amber-950/60",
    },
    5: {
        width: "100%",
        colorClass: "bg-red-600",
        trackBgClass: "bg-red-200 dark:bg-red-950/60",
    },
    Expert: {
        width: "100%",
        colorClass: "bg-red-600",
        trackBgClass: "bg-red-200 dark:bg-red-950/60",
    },
}

export function SkillItem({
    name,
    mastery,
    isDarkMode: _isDarkMode = false,
    isSelectionMode = false,
    isSelected = false,
    onSelect,
}: SkillItemProps) {
    const config = MASTERY_LEVELS[mastery] ?? MASTERY_LEVELS[4]

    const handleClick = () => {
        if (isSelectionMode && onSelect) {
            onSelect()
        }
    }

    return (
        <div
            onClick={handleClick}
            className={`flex items-center gap-3 py-1.5 px-2 rounded transition-colors ${
                isSelectionMode
                    ? "cursor-pointer hover:bg-accent dark:hover:bg-accent/50"
                    : ""
            } ${
                isSelected
                    ? "bg-red-50 ring-1 ring-red-500 dark:bg-red-950/30"
                    : ""
            }`}
        >
            <div
                className={`relative h-1.5 w-16 shrink-0 overflow-hidden rounded-full ${config.trackBgClass}`}
            >
                <div
                    className={`h-full transition-all duration-300 rounded-full ${config.colorClass}`}
                    style={{ width: config.width }}
                />
            </div>

            <span
                className={`text-sm font-normal ${
                    isSelected
                        ? "text-red-600 font-medium"
                        : "text-muted-foreground"
                }`}
            >
                {name}
            </span>
        </div>
    )
}
