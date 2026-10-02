import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { UserPage } from "@/modules/users"

type Props = {
    params: Promise<{ locale: string; userId: string }>
}

async function UserContent({ params }: Props) {
    const { userId } = await params

    return <UserPage userId={userId} />
}

export default async function UserDetailRoute({ params }: Props) {
    const t = await getTranslations("Common")

    return (
        <Suspense
            fallback={
                <p className="p-4 text-muted-foreground">{t("loading")}</p>
            }
        >
            <UserContent params={params} />
        </Suspense>
    )
}
