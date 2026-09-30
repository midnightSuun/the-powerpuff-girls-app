import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768

const mobileQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribe = (onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(mobileQuery)

    mediaQuery.addEventListener("change", onStoreChange)

    return () => mediaQuery.removeEventListener("change", onStoreChange)
}

const getSnapshot = () => window.matchMedia(mobileQuery).matches

const getServerSnapshot = () => false

export const useIsMobile = () => {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
