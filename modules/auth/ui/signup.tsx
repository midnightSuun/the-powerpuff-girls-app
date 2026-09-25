"use client"

import Link from "next/link"
import { useActionState } from "react"

import { signup } from "../api/signup"

export function Signup() {
    const [state, formAction, isPending] = useActionState(signup, {})

    return (
        <main className="mx-auto max-w-md p-6">
            <h1 className="mb-6 text-2xl font-semibold">Регистрация</h1>
            <form className="space-y-4" action={formAction}>
                <p className="space-y-1">
                    <label htmlFor="email">Email</label>
                    <input
                        className="block w-full border px-3 py-2"
                        id="email"
                        name="email"
                        type="email"
                        required
                    />
                </p>
                <p className="space-y-1">
                    <label htmlFor="password">Пароль</label>
                    <input
                        className="block w-full border px-3 py-2"
                        id="password"
                        name="password"
                        type="password"
                        required
                    />
                </p>
                <p className="space-y-1">
                    <label htmlFor="confirmPassword">Подтвердите пароль</label>
                    <input
                        className="block w-full border px-3 py-2"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                    />
                </p>
                {state.error && (
                    <p className="text-sm text-red-700" role="alert">
                        {state.error}
                    </p>
                )}
                <button
                    className="border px-4 py-2"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Регистрируем..." : "Зарегистрироваться"}
                </button>
            </form>
            <p className="mt-4 text-sm">
                Уже есть аккаунт? <Link href="/login">Войти</Link>
            </p>
        </main>
    )
}
