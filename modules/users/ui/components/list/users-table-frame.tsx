"use client"

import {
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    Suspense,
    useLayoutEffect,
    useState,
} from "react"

import { UsersTableSkeleton } from "./users-table-skeleton"

type Props = {
    children: ReactNode
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
    placeholder,
    previous,
}: {
    placeholder?: ReactNode
    previous: ReactNode
}) => {
    if (previous) {
        return (
            <div aria-busy="true" inert>
                {previous}
            </div>
        )
    }

    return placeholder ?? <UsersTableSkeleton />
}

export const UsersTableFrame = ({ children, placeholder }: Props) => {
    const [previous, setPrevious] = useState<ReactNode>(null)

    return (
        <Suspense
            fallback={
                <UsersTableFallback
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
