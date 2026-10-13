export type SelectOption = {
    id: string
    name: string
}

export const withCurrentOption = (
    options: SelectOption[],
    current?: SelectOption | null,
) => {
    if (!current || options.some((option) => option.id === current.id)) {
        return options
    }

    return [current, ...options]
}
