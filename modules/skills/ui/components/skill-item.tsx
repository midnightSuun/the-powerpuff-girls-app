import React from "react"

interface SkillItemProps {
    name: string
    mastery: string | number
}

const MASTERY_LEVELS: Record<
    string | number,
    { width: string; color: string; bgColor: string }
> = {
    0: { width: "0%", color: "transparent", bgColor: "#AEAEAE" },

    1: { width: "25%", color: "#626262", bgColor: "#AEAEAE" },
    Novice: { width: "25%", color: "#626262", bgColor: "#AEAEAE" },

    2: { width: "45%", color: "#0288D1", bgColor: "#9ED1ED" },
    Advanced: { width: "45%", color: "#0288D1", bgColor: "#9ED1ED" },

    3: { width: "60%", color: "#2E7D32", bgColor: "#AFCDB1" },
    Competent: { width: "60%", color: "#2E7D32", bgColor: "#AFCDB1" },

    4: { width: "75%", color: "#FFB800", bgColor: "#FFE49E" },
    Proficient: { width: "75%", color: "#FFB800", bgColor: "#FFE49E" },

    5: { width: "100%", color: "#C63031", bgColor: "#C63031" },
    Expert: { width: "100%", color: "#C63031", bgColor: "#C63031" },
}

export function SkillItem({ name, mastery }: SkillItemProps) {
    const config = MASTERY_LEVELS[mastery] ?? MASTERY_LEVELS[4]

    return (
        <div className="flex items-center gap-3 py-1.5">
            <div
                className="relative h-1.5 w-16 overflow-hidden"
                style={{ backgroundColor: config.bgColor }}
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
