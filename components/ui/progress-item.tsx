interface ProgressItemProps {
    name: string
    mastery: string | number
    isSelected?: boolean
}

const PROGRESS_STYLES = {
    none: {
        width: "0%",
        colorClass: "bg-transparent",
        trackBgClass: "bg-muted",
    },
    beginner: {
        width: "25%",
        colorClass: "bg-neutral-500 dark:bg-neutral-400",
        trackBgClass: "bg-muted",
    },
    intermediate: {
        width: "45%",
        colorClass: "bg-sky-500",
        trackBgClass: "bg-sky-200 dark:bg-sky-950/60",
    },
    competent: {
        width: "60%",
        colorClass: "bg-green-600",
        trackBgClass: "bg-green-200 dark:bg-green-950/60",
    },
    proficient: {
        width: "75%",
        colorClass: "bg-amber-500",
        trackBgClass: "bg-amber-200 dark:bg-amber-950/60",
    },
    expert: {
        width: "100%",
        colorClass: "bg-red-600",
        trackBgClass: "bg-red-200 dark:bg-red-950/60",
    },
} as const

const MASTERY_LEVELS: Record<string | number, keyof typeof PROGRESS_STYLES> = {
    0: "none",
    A1: "beginner",
    1: "beginner",
    Novice: "beginner",
    A2: "intermediate",
    2: "intermediate",
    Advanced: "intermediate",
    B1: "competent",
    3: "competent",
    Competent: "competent",
    B2: "proficient",
    4: "proficient",
    Proficient: "proficient",
    C1: "expert",
    5: "expert",
    Expert: "expert",
    C2: "expert",
    Native: "expert",
}

export function ProgressItem({
    name,
    mastery,
    isSelected = false,
}: ProgressItemProps) {
    const config = PROGRESS_STYLES[MASTERY_LEVELS[mastery] ?? "proficient"]

    return (
        <div className="flex items-center gap-3">
            <div
                className={`relative h-1.5 w-16 shrink-0 overflow-hidden rounded-full ${config.trackBgClass}`}
            >
                <div
                    className={`h-full rounded-full transition-all duration-300 ${config.colorClass}`}
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
