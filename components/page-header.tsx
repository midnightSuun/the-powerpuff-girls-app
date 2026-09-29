import { ReactNode } from "react"

type Props = {
    title: string
    children?: ReactNode
}

export function PageHeader({ title, children }: Props) {
    return (
        <header className="flex flex-col gap-3 px-4 pt-4 pb-3">
            <p className="text-sm text-muted-foreground">{title}</p>
            {children}
        </header>
    )
}
