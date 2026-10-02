import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { ResetPasswordPage } from "@/modules/auth/ui/reset-password"

export default async function Page() {
    const t = await getTranslations("Common")

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    {t("loading")}
                </div>
            }
        >
            <ResetPasswordPage />
        </Suspense>
    )
}
