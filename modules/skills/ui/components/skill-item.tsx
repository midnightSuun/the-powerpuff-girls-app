import React from "react"

interface SkillItemProps {
    name: string
    mastery: string | number
}

const MASTERY_LEVELS: Record<
    string | number,
    { width: string; color: string; bgColor: string }
> = {
    0: { width: "0%", color: "transparent", bgColor: "#454545" },

    1: { width: "25%", color: "#626262", bgColor: "#454545" },
    Novice: { width: "25%", color: "#626262", bgColor: "#454545" },

    2: { width: "45%", color: "#29B6F6", bgColor: "#145B7B" },
    Advanced: { width: "45%", color: "#29B6F6", bgColor: "#145B7B" },

    3: { width: "65%", color: "#66BB6A", bgColor: "#335D35" },
    Competent: { width: "65%", color: "#66BB6A", bgColor: "#335D35" },

    4: { width: "85%", color: "#FFB800", bgColor: "#7F5C00" },
    Proficient: { width: "85%", color: "#FFB800", bgColor: "#7F5C00" },

    5: { width: "100%", color: "#C63031", bgColor: "#C63031" },
    Expert: { width: "100%", color: "#C63031", bgColor: "#C63031" },
}

export function SkillItem({ name, mastery }: SkillItemProps) {
    const config = MASTERY_LEVELS[mastery] ?? MASTERY_LEVELS[4]

    return (
        <div className="flex items-center gap-3 py-1.5">
            <div
                className="relative h-1.5 w-16 overflow-hidden rounded-full"
                style={{ backgroundColor: config.bgColor }}
            >
                <div
                    className="h-full rounded-full transition-all duration-300"
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
