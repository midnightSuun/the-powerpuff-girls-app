"use client"

import {
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    Suspense,
    useLayoutEffect,
    useState,
} from "react"

import { UsersPageLoader } from "./users-page-loader"
import { UsersTableShell } from "./users-table-shell"

type Props = {
    children: ReactNode
    label?: ReactNode
    placeholder?: ReactNode
}

const UsersTableResolved = ({
    children,
    onResolved,
}: {
    children: ReactNode
    onResolved: Dispatch<SetStateAction<ReactNode>>
}) => {
    useLayoutEffect(() => {
        onResolved((current) => (current === children ? current : children))
    }, [children, onResolved])

    return children
}

const UsersTableFallback = ({
    label,
    placeholder,
    previous,
}: {
    label?: ReactNode
    placeholder?: ReactNode
    previous: ReactNode
}) => {
    return (
        <div className="relative min-h-40" aria-busy="true">
            {previous ? (
                <div inert>{previous}</div>
            ) : (
                (placeholder ?? <UsersTableShell />)
            )}
            <UsersPageLoader label={label} />
        </div>
    )
}

export const UsersTableFrame = ({ children, label, placeholder }: Props) => {
    const [previous, setPrevious] = useState<ReactNode>(null)

    return (
        <Suspense
            fallback={
                <UsersTableFallback
                    label={label}
                    placeholder={placeholder}
                    previous={previous}
                />
            }
        >
            <UsersTableResolved onResolved={setPrevious}>
                {children}
            </UsersTableResolved>
        </Suspense>
    )
}
