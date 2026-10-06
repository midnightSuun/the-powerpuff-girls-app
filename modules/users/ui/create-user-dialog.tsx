"use client"

import { cn } from "cn"
import { ChevronDown, Eye, EyeOff, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { type SubmitEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const fieldClassName =
    "h-12 w-full rounded border border-[#aeaeae] bg-transparent px-3 text-base leading-6 tracking-[0.15px] text-[#2e2e2e] shadow-none outline-none placeholder:text-[#626262] focus-visible:border-[#c63031] focus-visible:ring-0 md:text-base dark:bg-transparent dark:text-[#f5f5f7] dark:placeholder:text-[#aeaeae]"

const PlusIcon = () => {
    return (
        <svg
            aria-hidden
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 shrink-0"
        >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#C63031" />
        </svg>
    )
}

const PasswordInput = ({ label }: { label: string }) => {
    const t = useTranslations("Auth.Login")
    const [isVisible, setIsVisible] = useState(false)

    const handleToggleVisibility = () => {
        setIsVisible((current) => !current)
    }

    return (
        <div className="relative">
            <Input
                type={isVisible ? "text" : "password"}
                aria-label={label}
                placeholder={label}
                autoComplete="new-password"
                className={cn(fieldClassName, "pr-10")}
            />
            <button
                type="button"
                onClick={handleToggleVisibility}
                aria-label={isVisible ? t("hidePassword") : t("showPassword")}
                aria-pressed={isVisible}
                className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 text-[#626262] outline-none hover:text-[#2e2e2e] focus-visible:ring-3 focus-visible:ring-[#c63031]/30 dark:text-[#aeaeae] dark:hover:text-[#f5f5f7]"
            >
                {isVisible ? (
                    <EyeOff aria-hidden className="size-5" />
                ) : (
                    <Eye aria-hidden className="size-5" />
                )}
            </button>
        </div>
    )
}

const TemplateSelect = ({
    label,
    filled = false,
}: {
    label: string
    filled?: boolean
}) => {
    return (
        <div className="relative">
            <select
                aria-label={label}
                defaultValue=""
                className={cn(
                    fieldClassName,
                    "appearance-none pr-10",
                    !filled && "text-[#626262] dark:text-[#aeaeae]",
                )}
            >
                <option value="">{label}</option>
            </select>
            <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#626262] dark:text-[#aeaeae]"
            />
        </div>
    )
}

type Props = {
    label: string
}

export const CreateUserDialog = ({ label }: Props) => {
    const t = useTranslations("Users")
    const tDialog = useTranslations("Users.dialog")
    const tColumns = useTranslations("Users.columns")
    const tUser = useTranslations("User")

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
    }

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <Button
                        type="button"
                        variant="primaryV2"
                        className="h-10 w-[220px] gap-2 rounded-[40px] p-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] uppercase hover:border-transparent active:border-transparent active:bg-transparent"
                    />
                }
            >
                <PlusIcon />
                {label}
            </DialogTrigger>
            <DialogContent
                showCloseButton={false}
                overlayClassName="bg-black/50 backdrop-blur-none"
                className="flex max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-6 overflow-y-auto rounded-lg bg-white p-8 text-[#2e2e2e] shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-0 sm:max-w-[720px] dark:bg-[#2e2e2e] dark:text-[#f5f5f7]"
            >
                <DialogHeader className="flex-row items-center justify-between gap-4">
                    <DialogTitle className="text-xl leading-7 font-medium tracking-[0.15px] text-[#2e2e2e] dark:text-[#f5f5f7]">
                        {t("createUser")}
                    </DialogTitle>
                    <DialogClose
                        aria-label={tDialog("close")}
                        className="inline-flex size-8 shrink-0 items-center justify-center text-[#626262] outline-none hover:text-[#2e2e2e] focus-visible:ring-3 focus-visible:ring-[#c63031]/30 dark:text-[#aeaeae] dark:hover:text-[#f5f5f7]"
                    >
                        <X className="size-6" />
                    </DialogClose>
                </DialogHeader>
                <DialogDescription className="sr-only">
                    {tDialog("description")}
                </DialogDescription>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            type="email"
                            aria-label={tColumns("email")}
                            placeholder={tColumns("email")}
                            autoComplete="off"
                            className={fieldClassName}
                        />
                        <PasswordInput label={tDialog("password")} />
                        <Input
                            aria-label={tColumns("firstName")}
                            placeholder={tColumns("firstName")}
                            autoComplete="off"
                            className={fieldClassName}
                        />
                        <Input
                            aria-label={tColumns("lastName")}
                            placeholder={tColumns("lastName")}
                            autoComplete="off"
                            className={fieldClassName}
                        />
                        <TemplateSelect label={tColumns("department")} />
                        <TemplateSelect label={tColumns("position")} />
                        <label className="flex flex-col gap-1">
                            <span className="text-xs leading-4 text-[#626262] dark:text-[#aeaeae]">
                                {tUser("role")}
                            </span>
                            <TemplateSelect
                                label={tDialog("employee")}
                                filled
                            />
                        </label>
                    </div>
                    <DialogFooter className="mx-0 mt-2 mb-0 flex-row flex-wrap justify-end gap-3 rounded-none border-0 border-t-0 bg-transparent p-0">
                        <DialogClose
                            render={
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-10 w-40 rounded-[40px] px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] uppercase dark:border-[#aeaeae] dark:text-[#aeaeae] dark:hover:bg-transparent dark:hover:text-[#f5f5f7]"
                                />
                            }
                        >
                            {tDialog("cancel")}
                        </DialogClose>
                        <Button
                            type="submit"
                            variant="primary"
                            className="h-10 w-40 rounded-[40px] bg-[#c63031] px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] text-[#f5f5f7] uppercase hover:border-transparent hover:bg-[#b02a2b] hover:text-[#f5f5f7] active:border-transparent active:bg-[#c63031] active:text-[#f5f5f7]"
                        >
                            {tDialog("submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
