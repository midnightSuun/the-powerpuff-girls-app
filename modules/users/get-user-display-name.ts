export const getUserDisplayName = (
    firstName?: string | null,
    lastName?: string | null,
    fallback = "",
) => {
    const name = [firstName, lastName].filter(Boolean).join(" ")

    return name || fallback
}
