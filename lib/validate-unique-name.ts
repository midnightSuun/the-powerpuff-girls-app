export function normalizeName(name: string): string {
    return name.trim()
}

export function isNameDuplicate(
    name: string,
    existingNames: string[] = [],
): boolean {
    const normalized = normalizeName(name).toLowerCase()
    if (!normalized) return false
    return existingNames.some(
        (existing) => existing.trim().toLowerCase() === normalized,
    )
}
