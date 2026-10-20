import { useRouter } from "next/navigation"

import { useActionNotifications } from "@/hooks/use-action-notifications"

import type { UpdateCvDto } from "../types"

interface UseCvDetailsProps {
    onUpdate: (data: UpdateCvDto) => Promise<void> | void
}

export function useCvDetails({ onUpdate }: UseCvDetailsProps) {
    const router = useRouter()
    const notifications = useActionNotifications()

    const handleUpdateAndRefresh = async (data: UpdateCvDto) => {
        await onUpdate(data)
        notifications.success("updated")
        router.refresh()
    }

    return {
        handleUpdateAndRefresh,
    }
}
