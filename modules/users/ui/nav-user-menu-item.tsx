"use client"

import { type ReactNode } from "react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/navigation"

type Props = {
    label: string
    icon: ReactNode
    href?: string
    itemClassName?: string
    labelClassName?: string
    variant?: "destructive"
    onClick: () => void
}

export const NavUserMenuItem = ({
    label,
    icon,
    href,
    itemClassName,
    labelClassName,
    variant,
    onClick,
}: Props) => {
    const content = (
        <>
            {icon}
            <span className={labelClassName}>{label}</span>
        </>
    )

    if (!href) {
        return (
            <DropdownMenuItem
                variant={variant}
                onClick={onClick}
                className={itemClassName}
            >
                {content}
            </DropdownMenuItem>
        )
    }

    return (
        <DropdownMenuItem
            nativeButton={false}
            render={<Link href={href} />}
            onClick={onClick}
            className={itemClassName}
        >
            {content}
        </DropdownMenuItem>
    )
}
