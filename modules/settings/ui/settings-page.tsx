"use client"

import { ChevronDown } from "lucide-react"

import { PasswordField } from "@/components/password-field"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/modules/auth/ui/logout-button"

import { useSettings } from "../hooks/use-settings"

export function SettingsPage() {
    const {
        serverError,
        successMessage,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    } = useSettings()

    return (
        <main className="min-h-screen w-full bg-background text-foreground px-6 py-8 flex flex-col transition-colors duration-300">
            <div className="w-full max-w-2xl mx-auto mb-8 flex items-center justify-between">
                <h1 className="text-xl font-medium tracking-tight text-muted-foreground">
                    Settings
                </h1>
                <LogoutButton />
            </div>

            <div className="w-full max-w-2xl mx-auto space-y-6">
                {serverError && (
                    <div
                        className="p-3 text-xs text-destructive bg-destructive/10 rounded-md"
                        role="alert"
                    >
                        {serverError}
                    </div>
                )}
                {successMessage && (
                    <div
                        className="p-3 text-xs text-green-600 bg-green-500/10 rounded-md"
                        role="status"
                    >
                        {successMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                >
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground block">
                            Theme
                        </label>
                        <div className="relative">
                            <select
                                {...register("theme")}
                                className="w-full h-10 px-3 pr-10 text-sm bg-card border border-border rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-foreground"
                            >
                                <option value="Light">Light</option>
                                <option value="Dark">Dark</option>
                                <option value="Device settings">
                                    Device settings
                                </option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground block">
                            Language
                        </label>
                        <div className="relative">
                            <select
                                {...register("language")}
                                className="w-full h-10 px-3 pr-10 text-sm bg-card border border-border rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-foreground"
                            >
                                <option value="English">English</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Italian">Italian</option>
                                <option value="Polish">Polish</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Russian">Russian</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Ukrainian">Ukrainian</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <h2 className="text-sm font-medium">Change password</h2>

                        <div className="space-y-1">
                            <PasswordField
                                placeholder="Password"
                                error={errors.password?.message}
                                {...register("password")}
                            />
                            {errors.password && (
                                <span
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {errors.password.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <PasswordField
                                placeholder="New Password"
                                error={errors.newPassword?.message}
                                {...register("newPassword")}
                            />
                            {errors.newPassword && (
                                <span
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {errors.newPassword.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <PasswordField
                                placeholder="Confirm Password"
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <span
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            disabled={!isValid || isPending}
                            className={`w-32 text-white font-medium text-xs tracking-wider uppercase transition-colors ${
                                !isValid || isPending
                                    ? "bg-button-primary-default/50 cursor-not-allowed"
                                    : "bg-button-primary-default hover:bg-button-primary-default/90 cursor-pointer"
                            }`}
                        >
                            {isPending ? "CHANGING..." : "CHANGE"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    )
}
