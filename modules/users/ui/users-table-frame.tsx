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
        <>
            {previous ? (
                <div inert aria-hidden>
                    {previous}
                </div>
            ) : null}
            <UsersPageLoader label={label} />
        </>
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
