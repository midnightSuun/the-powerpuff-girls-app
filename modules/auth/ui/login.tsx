"use client"

import { login } from "../api/login"
import { logout } from "../api/logout"

export function Login() {
    const onLogin = async () => {
        await login({
            email: "yanina.sviridova24+2@gmail.com",
            password: "secret",
        })
    }
    const onLogout = async () => {
        await logout()
    }

    return (
        <div className="flex items-center gap-2">
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={onLogin}
            >
                Login
            </button>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={onLogout}
            >
                Logout
            </button>
        </div>
    )
}
