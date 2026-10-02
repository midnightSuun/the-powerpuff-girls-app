import { cn } from "cn"

type Props = {
    descending: boolean
}

export const SortArrow = ({ descending }: Props) => {
    return (
        <img
            alt=""
            src="/users/sort-arrow.svg"
            width={12}
            height={12}
            className={cn("shrink-0", descending && "rotate-180")}
        />
    )
}
