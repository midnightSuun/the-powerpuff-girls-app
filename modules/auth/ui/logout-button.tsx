"use client"

import { logout } from "../api/logout"

export const LogoutButton = () => {
    return (
        <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={logout}
        >
            Logout
        </button>
    )
}
