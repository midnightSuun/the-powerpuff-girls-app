import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024

const mobileQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
const tabletQuery = `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${DESKTOP_BREAKPOINT - 1}px)`

const subscribeToQuery = (query: string, onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(query)

    mediaQuery.addEventListener("change", onStoreChange)

    return () => mediaQuery.removeEventListener("change", onStoreChange)
}

export const useIsMobile = () => {
    return useSyncExternalStore(
        (onStoreChange) => subscribeToQuery(mobileQuery, onStoreChange),
        () => window.matchMedia(mobileQuery).matches,
        () => false,
    )
}

export const useIsTablet = () => {
    return useSyncExternalStore(
        (onStoreChange) => subscribeToQuery(tabletQuery, onStoreChange),
        () => window.matchMedia(tabletQuery).matches,
        () => false,
    )
}
