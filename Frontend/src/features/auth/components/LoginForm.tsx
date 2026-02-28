import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Lock, User, UserCheck2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useLogin } from "../hooks/useLogin"
import { inputIconClass } from "@/tailwindStyle"

export const LoginForm = () => {

    const [formData, setFormData] = useState({ loginId: "", password: "" });
    const [errors, setErrors] = useState<{ userName?: string; password?: string }>();

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
            login({ loginId: formData.loginId, password: formData.password });
        }
    };

    return (
        <form onSubmit={handleSubmit} >
            <Card className="w-[90vw] md:w-[350px] lg:w-[450px]">
                <CardHeader>
                    <CardTitle className="font-display text-2xl">Sign in</CardTitle>
                    {/* <p className="text-sm text-muted-foreground">
                        Use your studio credentials to continue.
                    </p> */}
                    {error && (
                        <span className="text-red-500 text-sm">{error.message}</span>
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
                                type="password" className="pl-10">
                                <Lock className={inputIconClass} />
                            </Input>
                        </div>
                    </div>
                    {/* <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Need help? Contact support.</span>
                        <button className="font-semibold text-foreground hover:text-primary">
                            Reset password
                        </button>
                    </div> */}
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