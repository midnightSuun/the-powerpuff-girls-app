"use client"

import { User } from "lucide-react"
import { useEffect, useState } from "react"

const UserCrumbIcon = () => {
    return (
        <User
            aria-hidden
            strokeWidth={2.25}
            className="size-4 shrink-0 fill-button-primary-default text-button-primary-default"
        />
    )
}

export const UserEmail = ({ userId }: { userId: string }) => {
    const [result, setResult] = useState<{
        userId: string
        email: string | null
    } | null>(null)
    const isCurrentUser = result?.userId === userId
    const email = isCurrentUser ? result.email : null

    useEffect(() => {
        let isCurrent = true

        fetch(`/api/users/${encodeURIComponent(userId)}/email`)
            .then(async (response) => {
                if (!response.ok) return null

                const data = (await response.json()) as { email: string | null }

                return data.email
            })
            .then((nextEmail) => {
                if (!isCurrent) return

                setResult({ userId, email: nextEmail })
            })
            .catch(() => {
                if (!isCurrent) return

                setResult({ userId, email: null })
            })

        return () => {
            isCurrent = false
        }
    }, [userId])

    return (
        <span className="inline-flex min-w-0 items-center gap-1.5">
            <UserCrumbIcon />
            {email ? (
                <span className="truncate">{email}</span>
            ) : !isCurrentUser ? (
                <span className="inline-block h-4 w-40 rounded bg-muted" />
            ) : null}
        </span>
    )
}
