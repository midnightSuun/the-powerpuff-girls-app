"use client"

import { useEffect, useState } from "react"

import { getProfileOptions } from "../api/get-profile-options"
import { type SelectOption, withCurrentOption } from "../select-option"

const optionKey = (option?: SelectOption | null) => option?.id ?? ""

export const useProfileOptions = (
    isOpen: boolean,
    currentDepartment?: SelectOption | null,
    currentPosition?: SelectOption | null,
) => {
    const [departments, setDepartments] = useState<SelectOption[]>(() =>
        currentDepartment ? [currentDepartment] : [],
    )
    const [positions, setPositions] = useState<SelectOption[]>(() =>
        currentPosition ? [currentPosition] : [],
    )
    const nextOptionKey = `${optionKey(currentDepartment)}:${optionKey(currentPosition)}`
    const [trackedOptionKey, setTrackedOptionKey] = useState(nextOptionKey)

    if (nextOptionKey !== trackedOptionKey) {
        setTrackedOptionKey(nextOptionKey)
        setDepartments(currentDepartment ? [currentDepartment] : [])
        setPositions(currentPosition ? [currentPosition] : [])
    }

    useEffect(() => {
        if (!isOpen) return

        let isCancelled = false

        const loadOptions = async () => {
            try {
                const data = await getProfileOptions()
                if (isCancelled) return

                setDepartments(
                    withCurrentOption(data.departments, currentDepartment),
                )
                setPositions(withCurrentOption(data.positions, currentPosition))
            } catch (error) {
                console.error("Failed to load user options:", error)
            }
        }

        void loadOptions()

        return () => {
            isCancelled = true
        }
    }, [currentDepartment, currentPosition, isOpen])

    return { departments, positions }
}
