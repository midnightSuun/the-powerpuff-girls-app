"use client"

import {
    createContext,
    type ReactNode,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
} from "react"

type HeaderToolbarAction = {
    label: string
    onClick: () => void
}

const noop = () => {}

const HeaderToolbarActionSetterContext =
    createContext<(action: HeaderToolbarAction | null) => void>(noop)

const HeaderToolbarActionValueContext =
    createContext<HeaderToolbarAction | null>(null)

export const HeaderToolbarActionsProvider = ({
    children,
}: {
    children: ReactNode
}) => {
    const [action, setAction] = useState<HeaderToolbarAction | null>(null)

    return (
        <HeaderToolbarActionSetterContext.Provider value={setAction}>
            <HeaderToolbarActionValueContext.Provider value={action}>
                {children}
            </HeaderToolbarActionValueContext.Provider>
        </HeaderToolbarActionSetterContext.Provider>
    )
}

export const useHeaderToolbarAction = (
    label: string | null,
    onClick: () => void,
) => {
    const setAction = useContext(HeaderToolbarActionSetterContext)
    const onClickRef = useRef(onClick)

    useLayoutEffect(() => {
        onClickRef.current = onClick
    }, [onClick])

    useLayoutEffect(() => {
        if (!label) {
            setAction(null)
            return
        }

        setAction({
            label,
            onClick: () => {
                onClickRef.current()
            },
        })

        return () => {
            setAction(null)
        }
    }, [label, setAction])
}

export const useHeaderToolbarActionValue = () =>
    useContext(HeaderToolbarActionValueContext)
