export type SortOrder = "asc" | "desc"

export const sortByLocale = <T>(
    items: T[],
    getValue: (item: T) => string,
    order: SortOrder,
    locale: string,
) => {
    const collator = new Intl.Collator(locale, {
        sensitivity: "accent",
        numeric: true,
    })

    return [...items].sort((left, right) => {
        const leftValue = getValue(left).trim()
        const rightValue = getValue(right).trim()

        if (!leftValue && !rightValue) return 0
        if (!leftValue) return 1
        if (!rightValue) return -1

        const result = collator.compare(leftValue, rightValue)

        return order === "desc" ? -result : result
    })
}
