import type { Proficiency } from "@/gql/generated/graphql"

const PROFICIENCY_LEVELS = [
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
    "Native",
] as const satisfies readonly Proficiency[]

interface UseLanguageProficiencySelectProps {
    onValueChange: (value: Proficiency) => void
}

export function useLanguageProficiencySelect({
    onValueChange,
}: UseLanguageProficiencySelectProps) {
    const handleValueChange = (selectedValue: string | null) => {
        const proficiency = PROFICIENCY_LEVELS.find(
            (level) => level === selectedValue,
        )
        if (proficiency) {
            onValueChange(proficiency)
        }
    }

    return {
        proficiencyLevels: PROFICIENCY_LEVELS,
        handleValueChange,
    }
}
