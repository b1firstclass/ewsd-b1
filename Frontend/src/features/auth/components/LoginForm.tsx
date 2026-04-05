import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useLogin } from "../hooks/useLogin"
import { inputIconClass } from "@/tailwindStyle"
import { getRoleBasedRedirect, getUserRoleFromToken } from "@/utils/jwtUtils"
import { storage } from "@/lib/utils"

const formatRoleLabel = (role: string) =>
    role
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());

export const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ loginId: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{ userName?: string; password?: string }>();
    const [showPassword, setShowPassword] = useState(false);

    const { mutate: login, isPending, error } = useLogin();

    const validate = () => {
        const newErrors: { loginId?: string; password?: string } = {};

        if (!formData.loginId) {
            newErrors.loginId = "Login Id is required."
        }

        if (!formData.password) {
            newErrors.password = "Password is required."
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (validate()) {
            login(
                {
                    credentials: { loginId: formData.loginId, password: formData.password },
                    rememberMe,
                },
                {
                    onSuccess: (data) => {
                        const redirectPath = getRoleBasedRedirect(data.token);

                        if (data.firstTimeLogin) {
                            storage.setFirstLoginWelcome(formatRoleLabel(getUserRoleFromToken(data.token)));
                        }

                        navigate({ to: redirectPath });
                    },
                }
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle className="font-display text-2xl">Sign in</CardTitle>
                    {error && (
                        <span className="text-sm text-destructive">{error.message}</span>
                    )}
                </CardHeader>
                <CardContent className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="loginId">Login Id</Label>
                        <div className="relative">
                            <Input
                                id="loginId"
                                type="text"
                                value={formData.loginId}
                                onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                placeholder="Enter Login Id"
                                error={errors?.userName}
                                className="pl-10"
                            >
                                <User className={inputIconClass} />
                            </Input>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input id="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors?.password}
                                placeholder="Enter password"
                                type={showPassword ? "text" : "password"} className="pl-10 pr-11">
                                <Lock className={inputIconClass} />
                            </Input>
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                className="absolute right-3 top-[22px] -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center pt-1">
                        <label
                            htmlFor="rememberMe"
                            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
                        >
                            <input
                                id="rememberMe"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                            />
                            <span>Remember me</span>
                        </label>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit"
                        className="w-full"
                        isLoading={isPending}
                    >Login</Button>
                </CardFooter>
            </Card>
        </form>
    )
}
