import { Suspense } from "react"

import { LoadingText } from "@/components/loading-text"
import { ResetPasswordPage } from "@/modules/auth/ui/reset-password"

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <LoadingText namespace="Common" />
                </div>
            }
        >
            <ResetPasswordPage />
        </Suspense>
    )
}
