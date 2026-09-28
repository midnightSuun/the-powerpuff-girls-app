import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Props = {
    src: string | null
    firstName: string | null
    lastName: string | null
}

export function UserAvatar({ src, firstName, lastName }: Props) {
    const name = [firstName, lastName].filter(Boolean).join(" ")

    return (
        <Avatar>
            {src ? <AvatarImage src={src} alt={name} /> : null}
            <AvatarFallback className="rounded-full">
                {firstName?.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    )
}
