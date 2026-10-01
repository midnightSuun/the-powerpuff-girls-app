"use client"

import { useEffect } from "react"

let lockCount = 0
let lockedBody: HTMLElement | null = null
let originalOverflow = ""

function acquireBodyScrollLock() {
    if (lockCount === 0) {
        lockedBody = document.body
        originalOverflow = lockedBody.style.overflow
        lockedBody.style.overflow = "hidden"
    }

    lockCount += 1
    let released = false

    return () => {
        if (released) return
        released = true
        lockCount -= 1

        if (lockCount === 0 && lockedBody) {
            lockedBody.style.overflow = originalOverflow
            lockedBody = null
        }
    }
}

export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return
        return acquireBodyScrollLock()
    }, [isLocked])
}
