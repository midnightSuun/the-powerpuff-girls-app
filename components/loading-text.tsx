"use client"

import { useTranslations } from "next-intl"

type Props = {
    namespace: "Common" | "Skills" | "User" | "Users"
}

export const LoadingText = ({ namespace }: Props) => {
    const t = useTranslations(namespace)

    return t("loading")
}
