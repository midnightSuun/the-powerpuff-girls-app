import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Props = {
    src: string | null
    firstName: string | null
    lastName: string | null
    email: string
    fallbackClassName?: string
    avatarClassName?: string
}

const getInitial = (value: string | null | undefined) =>
    value?.trim().charAt(0).toUpperCase() || ""

export function UserAvatar({
    src,
    firstName,
    lastName,
    email,
    fallbackClassName,
    avatarClassName,
}: Props) {
    const name = [firstName, lastName].filter(Boolean).join(" ")
    const initial =
        getInitial(firstName) || getInitial(lastName) || getInitial(email)

    return (
        <Avatar className={avatarClassName}>
            {src ? <AvatarImage src={src} alt={name || email} /> : null}
            <AvatarFallback className={cn("rounded-full", fallbackClassName)}>
                {initial}
            </AvatarFallback>
        </Avatar>
    )
}
