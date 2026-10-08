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
import { UsersTableSkeleton } from "./users-table-skeleton"

type Props = {
    children: ReactNode
    label?: ReactNode
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
    previous,
}: {
    label?: ReactNode
    previous: ReactNode
}) => {
    return (
        <div className="relative min-h-40" aria-busy="true">
            {previous ? <div inert>{previous}</div> : <UsersTableSkeleton />}
            <UsersPageLoader label={label} />
        </div>
    )
}

export const UsersTableFrame = ({ children, label }: Props) => {
    const [previous, setPrevious] = useState<ReactNode>(null)

    return (
        <Suspense
            fallback={<UsersTableFallback label={label} previous={previous} />}
        >
            <UsersTableResolved onResolved={setPrevious}>
                {children}
            </UsersTableResolved>
        </Suspense>
    )
}
