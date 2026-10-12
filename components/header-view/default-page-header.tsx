"use client"

import { Suspense } from "react"

import { useHeaderToolbarActionValue } from "@/components/header-toolbar-action"
import { SearchInput } from "@/components/search-input"
import { AddItemButton } from "@/components/ui/list-management-buttons"

import { crumbClassName, headerToolbarButtonClassName } from "./styles"
import type { HeaderCopy, HeaderDefaultPage } from "./types"

type Props = {
    page: HeaderDefaultPage
    copy: HeaderCopy
}

export const DefaultPageHeader = ({ page, copy }: Props) => {
    const toolbarAction = useHeaderToolbarActionValue()
    const showToolbar = Boolean(page.showSearch || toolbarAction)

    return (
        <header className="w-full shrink-0 bg-[#f5f5f7] dark:bg-[#2e2e2e]">
            <div className="flex h-14 items-center px-5">
                <p className={crumbClassName}>{copy[page.title]}</p>
            </div>
            {showToolbar ? (
                <div className="flex h-14 items-center px-5">
                    {page.showSearch ? (
                        <Suspense fallback={<div className="h-10 w-80" />}>
                            <SearchInput />
                        </Suspense>
                    ) : null}
                    {toolbarAction ? (
                        <div className="ml-auto">
                            <AddItemButton
                                label={toolbarAction.label}
                                onClick={toolbarAction.onClick}
                                variant="primaryV2"
                                className={headerToolbarButtonClassName}
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}
        </header>
    )
}
