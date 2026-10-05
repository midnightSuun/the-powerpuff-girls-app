"use client"

import { useTranslations } from "next-intl"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { CvItem, UpdateCvDto } from "../../types"

interface CvDetailsFormProps {
    cv: CvItem
    onUpdate: (data: UpdateCvDto) => Promise<void> | void
}

export function CvDetailsForm({ cv, onUpdate }: CvDetailsFormProps) {
    const t = useTranslations("CV.form")
    const [name, setName] = useState(cv.name)
    const [education, setEducation] = useState(cv.education)
    const [description, setDescription] = useState(cv.description)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const isDirty =
        name !== cv.name ||
        education !== cv.education ||
        description !== cv.description

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            setError(null)
            await onUpdate({ name, education, description })
        } catch {
            setError(t("updateError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-[852px] flex-col gap-5"
        >
            {error && (
                <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-1">
                <label
                    htmlFor="cv-name"
                    className="pl-2 text-xs text-muted-foreground"
                >
                    {t("name")}
                </label>
                <Input
                    id="cv-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 rounded-none border-[#cccccc] bg-transparent px-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring dark:border-border"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label
                    htmlFor="cv-education"
                    className="pl-2 text-xs text-muted-foreground"
                >
                    {t("education")}
                </label>
                <Input
                    id="cv-education"
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="h-8 rounded-none border-[#cccccc] bg-transparent px-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring dark:border-border"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label
                    htmlFor="cv-description"
                    className="pl-2 text-xs text-muted-foreground"
                >
                    {t("description")}
                </label>
                <Textarea
                    id="cv-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-30 resize-y rounded-none border-[#cccccc] bg-transparent p-2 text-xs leading-normal shadow-none focus-visible:ring-1 focus-visible:ring-ring dark:border-border"
                />
            </div>

            <div className="flex justify-end pt-1">
                <Button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className="h-8! w-26.5! min-w-26.5! px-0! py-0! rounded-full bg-[#d7352c] text-[10px] font-normal tracking-normal text-white shadow-none hover:bg-[#c52e26] disabled:bg-[#b8b8b8] disabled:text-white dark:disabled:bg-[#626262]"
                >
                    {isSubmitting ? t("updating") : t("update")}
                </Button>
            </div>
        </form>
    )
}
