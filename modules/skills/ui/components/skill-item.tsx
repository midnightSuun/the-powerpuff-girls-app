import { FlightDataSegment } from "next/dist/shared/lib/app-router-types"
import React from "react"

interface SkillItemProps {
    name: string
    mastery: string | number
    isDarkMode?: boolean
}

const MASTERY_LEVELS: Record<
    string | number,
    { width: string; color: string; lightBg: string; darkBg: string }
> = {
    0: {
        width: "0%",
        color: "transparent",
        lightBg: "#454545",
        darkBg: "#454545",
    },

    1: {
        width: "25%",
        color: "#626262",
        lightBg: "#454545",
        darkBg: "#454545",
    },
    Novice: {
        width: "25%",
        color: "#626262",
        lightBg: "#454545",
        darkBg: "#454545",
    },

    2: {
        width: "45%",
        color: "#0288D1",
        lightBg: "#9ED1ED",
        darkBg: "#145B7B",
    },
    Advanced: {
        width: "45%",
        color: "#0288D1",
        lightBg: "#9ED1ED",
        darkBg: "#145B7B",
    },

    3: {
        width: "60%",
        color: "#2E7D32",
        lightBg: "#AFCDB1",
        darkBg: "#335D35",
    },
    Competent: {
        width: "60%",
        color: "#2E7D32",
        lightBg: "#AFCDB1",
        darkBg: "#335D35",
    },

    4: {
        width: "75%",
        color: "#FFB800",
        lightBg: "#FFE49E",
        darkBg: "#7F5C00",
    },
    Proficient: {
        width: "75%",
        color: "#FFB800",
        lightBg: "#FFE49E",
        darkBg: "#7F5C00",
    },

    5: {
        width: "100%",
        color: "#C63031",
        lightBg: "#C63031",
        darkBg: "#C63031",
    },
    Expert: {
        width: "100%",
        color: "#C63031",
        lightBg: "#C63031",
        darkBg: "#C63031",
    },
}

export function SkillItem({
    name,
    mastery,
    isDarkMode = false,
}: SkillItemProps) {
    const config = MASTERY_LEVELS[mastery] ?? MASTERY_LEVELS[4]
    const trackBgColor = isDarkMode ? config.darkBg : config.lightBg

    return (
        <div className="flex items-center gap-3 py-1.5">
            <div
                className="relative h-1.5 w-16 overflow-hidden"
                style={{ backgroundColor: trackBgColor }}
            >
                <div
                    className="h-full transition-all duration-300"
                    style={{
                        width: config.width,
                        backgroundColor: config.color,
                    }}
                />
            </div>

            <span className="text-sm font-normal text-gray-500">{name}</span>
        </div>
    )
}
