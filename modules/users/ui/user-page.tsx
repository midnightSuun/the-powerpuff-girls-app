import { getTranslations } from "next-intl/server"

import { getUser } from "../api/get-user"
import { UserAvatar } from "./user-avatar"

type Props = {
    userId: string
}

export async function UserPage({ userId }: Props) {
    const t = await getTranslations("User")
    const user = await getUser(userId)

    const firstName = user.profile.first_name ?? ""
    const lastName = user.profile.last_name ?? ""
    const fullName = [firstName, lastName].filter(Boolean).join(" ")

    return (
        <main className="min-h-screen w-full bg-background text-foreground px-6 pt-4 pb-8 flex flex-col transition-colors duration-300">
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4 border-b border-border pb-6">
                    <UserAvatar
                        src={user.profile.avatar ?? null}
                        firstName={firstName}
                        lastName={lastName}
                        email={user.email}
                    />
                    <div>
                        <h1 className="text-xl font-medium tracking-tight">
                            {fullName || t("title")}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">
                            {t("email")}
                        </span>
                        <span className="font-medium">{user.email}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">
                            {t("role")}
                        </span>
                        <span className="font-medium uppercase">
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>
        </main>
    )
}
